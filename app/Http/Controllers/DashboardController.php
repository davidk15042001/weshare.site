<?php

namespace App\Http\Controllers;

use App\Mail\InvoiceMail;
use App\Models\Card;
use App\Models\Plan;
use App\Service\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use NumberFormatter;
use stdClass;
use App\Mail\SendWelcome;
use App\Models\Transaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Exception;
use Illuminate\Support\Facades\Mail;

class DashboardController extends Controller
{
    public function show(Request $request){

        $user = auth()->user();
        if($request->has('session_id')){
            $sessId = $request->get('session_id');
            $checkout = $request->user()->stripe()->checkout->sessions->retrieve($request->get('session_id'));

            if($checkout->mode == 'subscription'){
                $stripeSubscription = $request->user()->stripe()->subscriptions->retrieve($checkout->subscription);
                // return $stripeSubscription;
                $metadata = $stripeSubscription->metadata;
                // return $stripeSubscription->metadata;
                $transId = $metadata->transaction_id;
                $trans = Transaction::where("gateway_reference", $sessId)->first();
                if($trans)
                    return redirect()->route("dashboard")->with("error", "Transaction was already processed");
                $trans = Transaction::with(["user", "plan"])->find($transId);
                if(!$trans)
                    return redirect()->route("dashboard")->with("error", "Transaction not found");
                if($trans->status != 'pending' || $trans->user_id != auth()->id())
                    return redirect()->route("dashboard")->with("error", "Transaction was already processed");
                $plan = Plan::find($trans->plan_id);
                $firstItem = $stripeSubscription->items->first();
                $isSinglePrice = $stripeSubscription->items->count() === 1;
                $existingSubscription = $request->user()->subscriptions()->where('stripe_id', $stripeSubscription->id)->first();
                if (!$existingSubscription) {
                    $subscription = $request->user()->subscriptions()->create([
                        'name' => $plan->name,
                        'stripe_id' => $stripeSubscription->id,
                        'stripe_status' => $stripeSubscription->status,
                        'stripe_price' => $isSinglePrice ? $firstItem->price->id : null,
                        'quantity' => $isSinglePrice ? ($firstItem->quantity ?? null) : null,
                        'trial_ends_at' => $stripeSubscription->trial_end,
                        'ends_at' => null,
                    ]);

                    foreach ($stripeSubscription->items as $item) {
                        $subscription->items()->create([
                            'stripe_id' => $item->id,
                            'stripe_product' => $item->price->product,
                            'stripe_price' => $item->price->id,
                            'quantity' => $item->quantity ?? null,
                        ]);
                    }

                    $data = [
                        "name" => $request->user()->name,
                        "email" => $request->user()->email,
                        "plan" => 'pro'
                    ];
                    Mail::to($request->user()->email)->send(new SendWelcome($data));
                }

                $trans->gateway_reference = $sessId;
                $trans->status = "success";
                $trans->save();

                //Send receipt
                try{
                    $pdf = Pdf::loadView('pdf.subscription-receipt', [
                        'transaction' => $trans
                    ]);
                    $pdfPath = storage_path("app/invoices/invoice_{$user->id}.pdf");
                    $pdf->save($pdfPath);
                    Mail::to([$request->user()->email, config("mail.support.address")])->send(new InvoiceMail($trans, $pdfPath));
                }catch(Exception $ex){

                }
            }
        }

        $cards = Card::where('user_id', $request->user()->id)->get();
        return Inertia::render('Dashboard', [
            'cards' => $cards,
        ]);
    }

}
