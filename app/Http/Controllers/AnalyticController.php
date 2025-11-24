<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalyticsRequest;
use App\Models\Analytic;
use App\Models\Card;
use Illuminate\Http\Request;
use stdClass;
use Illuminate\Support\Facades\DB;

class AnalyticController extends Controller
{
    public function index(Request $request){
        $account = 'personal';
        $interval = 'daily';
        $counter = 6;

        if($request->has('account')) $account = $request->account;

        if($account == 'team'){
            $c2c = DB::connection('backoffice')->table('c2c')->where('cuid2', $request->user()->contact)->first();
            $company = DB::connection('backoffice')->table('contacts')->where('uid', $c2c->cuid)->first();

            $contactIds = DB::connection('backoffice')
                ->table('contacts as c')
                ->leftJoin('c2c', 'c.uid', '=', 'c2c.cuid2')
                ->select('c.uid as id', 'c.firstname', 'c.lastname', 'c.active')
                ->where('c2c.cuid', $c2c->cuid)
                ->where('c.active', 1)
                ->where('c.archive', 0)
                ->get()
                ->pluck('id')
                ->toArray();
            // $cards = Card::whereIn('id', $request->card)->pluck('id')->toArray();
            $cards = DB::table('cards')
                ->leftJoin('users', 'cards.user_id', '=', 'users.id')
                ->select('cards.id as cid')
                ->whereIn('users.contact', $contactIds)
                ->pluck('cid')
                ->toArray();
        } else {
            $cards = Card::where('user_id', $request->user()->id)->pluck('id')->toArray();
        }

        if($request->has('interval')) $interval = $request->interval;
        if($request->has('counter')) $counter = $interval == 'daily' ? $request->counter - 1 : $request->counter;
        if(!in_array($interval, ['daily', 'quarterly', 'yearly', 'custom'])) return abort(404);
        
        switch($interval){
            // case 'monthly':
            //     $counter = 5;
            //     $format = 'M';
            //     $key = 'months';
            //     break;
            // case 'weekly':
            //     $counter = 4;
            //     $format = 'W';
            //     $key = 'weeks';
            //     break;
            case 'daily':
                //$counter = 6;
                $format = $counter > 6 ? 'd' : 'D';
                $key = 'days';
                $start = date('Y-m-d', strtotime("-$counter $key"));
                $end = date('Y-m-d');
                break;
            case 'quarterly':
                //$counter = 6;
                $format = 'M';
                $key = 'months';
                if($counter < 0) {
                    $counter = $counter * -1;
                    $start = date('Y-m-d', strtotime('first day of -' . (((date('n') - 1) % 3) + 3) . ' month'));
                    $end = date('Y-m-d', strtotime('last day of -' . (((date('n') - 1) % 3) + 1) . ' month'));
                } else {
                    $current_quarter = ceil(date('n') / 3);
                    $start = date('Y-m-d', strtotime(date('Y') . '-' . (($current_quarter * 3) - 2) . '-1'));
                    $end = date('Y-m-t', strtotime(date('Y') . '-' . (($current_quarter * 3)) . '-1'));
                }
                break;
            case 'yearly':
                //$counter = 6;
                $format = 'M';
                $key = 'months';
                if($counter < 0) {
                    $counter = $counter * -1;
                    $start = date('Y-m-d', strtotime("last year January 1st"));
                    $end = date('Y-m-d', strtotime("last year December 31st"));
                } else {
                    $start = date('Y-01-01');
                    $end = date('Y-12-31');
                }
                break;
            case 'custom':
                //$counter = 6;
                $format = 'd';
                $key = 'days';
                $start = date('Y-m-d', strtotime($request->start_date));
                $end = date('Y-m-d', strtotime($request->end_date));
                break;
        }

        if(in_array('click', $request->type)){
            $socials = Analytic::whereIn('card_id', $cards)->where('type','click')->where('social', '>', '')->groupBy('social')->pluck('social')->toArray();
        }
        $analytics = Analytic::whereIn('card_id', $cards);
        if($request->has('type')){
            $analytics->whereIn('type', $request->type);
            if(in_array('click', $request->type)){
                $from = date(($interval == 'monthly' ? 'Y-m-01':'Y-m-d'), strtotime("-1 $key"));
                $analytics->where('social', '>', '')->where('date', '>=', $from);
            }else{
                $analytics->where('date', '>=', $start)->where('date', '<=', $end);
            }
        }
        $analytics = $analytics->orderBy('date', 'DESC')->get();

        $labels = [];
        $visits = [];
        $shares = [];
        $scans = [];
        $clicks = [];
        if(in_array('click', $request->type)){
            foreach($socials as $social){
                if(!isset($clicks[$social])) $clicks[$social] = [];
                for($i=0; $i<=1; $i++){
                    $time = $i == 0 ? time() : strtotime("-$i $key");
                    $kk = date(($interval == 'monthly' ? 'M':'D'), $time);
                    if(!isset($clicks[$social][$kk])) $clicks[$social][$kk] = 0;
                }
            }
        }else{
            switch($interval){
                case 'daily': 
                    for($i=$counter; $i>= 0; $i--){
                        $time = $i == 0 ? time() : strtotime("-$i $key");
                        $label = date($format, $time);
                        if(in_array($label, $labels)) continue;
                        if(!isset($visits[$label])) $visits[$label] = 0;
                        if(!isset($shares[$label])) $shares[$label] = 0;
                        if(!isset($scans[$label])) $scans[$label] = 0;
                        $labels[] = $label;
                    }
                    break;
                case 'quarterly':
                    for($i=0; $i<=$counter-1; $i++){
                        $label = date($format, strtotime( "+$i month", strtotime( $start )));
                        if(in_array($label, $labels)) continue;
                        if(!isset($visits[$label])) $visits[$label] = 0;
                        if(!isset($shares[$label])) $shares[$label] = 0;
                        if(!isset($scans[$label])) $scans[$label] = 0;
                        $labels[] = $label;
                    }
                    break;
                case 'yearly':
                    for($i=1; $i<=$counter; $i++){
                        $time = strtotime((date('Y')-1)."-$i");
                        $label = date($format, $time);

                        if(in_array($label, $labels)) continue;
                        if(!isset($visits[$label])) $visits[$label] = 0;
                        if(!isset($shares[$label])) $shares[$label] = 0;
                        if(!isset($scans[$label])) $scans[$label] = 0;
                        $labels[] = $label;
                    }
                    break;
                case 'custom':
                    $s = strtotime($start);
                    $e = strtotime($end);
                    $datediff = $e - $s;
                    $counter = round($datediff / (60 * 60 * 24));

                    for($i=0; $i<=$counter; $i++){
                        $label = date($format, strtotime( "+$i day", strtotime($start)));

                        if(in_array($label, $labels)) continue;
                        if(!isset($visits[$label])) $visits[$label] = 0;
                        if(!isset($shares[$label])) $shares[$label] = 0;
                        if(!isset($scans[$label])) $scans[$label] = 0;
                        $labels[] = $label;
                    }
                    break;
            }
        }

        foreach($analytics as $analytic){
            $k = date($format, strtotime($analytic->date));
            
            if($analytic->type == 'visit') $visits[$k] += $analytic->counter;
            if($analytic->type == 'share') $shares[$k] += $analytic->counter;
            if($analytic->type == 'scan') $scans[$k] += $analytic->counter;
            if($analytic->type == 'click') $clicks[$analytic->social][$k] += $analytic->counter;
        }
        if(in_array('click', $request->type)){
            $socials = [];
            foreach($clicks as $social => $values){
                $r = new stdClass;
                list($current, $previous) = array_values($values);
                $r->social = $social;
                $r->gain = $current > $previous ? 'up' : 'down';
                $r->count = $current;
                $socials[] = $r;
            }
            $response = $socials;
        }else{
            $response = [
                'labels' => $labels,
                'visits' => array_values($visits),
                'shares' => array_values($shares),
                'scans' => array_values($scans)
            ];
        }
        return response()->json($response);
    }

    public function store(AnalyticsRequest $request){
        $analytics = Analytic::where('card_id', $request->card_id)
                            ->where('type', $request->type)
                            ->where('social', $request->social)
                            ->where('date', date('Y-m-d'))
                            ->first();

        if(!$analytics){
            $analytics = new Analytic();
            $analytics->card_id = $request->card_id;
            $analytics->social = $request->social;
            $analytics->type = $request->type;
            $analytics->date = date('Y-m-d');
            $analytics->counter = 0;
        }

        $analytics->counter += 1;
        $analytics->save();

    }
}
