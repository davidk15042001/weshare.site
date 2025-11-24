<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Imports\SitesImport;
use App\Exports\UnsuccessfulSitesExport;
use Excel;

class BulkUploadController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Select c.uid, c.company, c.alias, c.firstname, c.lastname, cg.groupuid, cgroups.name from `contacts` as c
        // left join con_group as cg on c.uid = cg.cuid
        // left join contactgroups as cgroups on cg.groupuid = cgroups.uid
        // where c.active = 1 and c.archive = 0
        // order by c.uid asc

        $customers = [];

        $contacts = DB::connection('backoffice')
            ->table('contacts as c')
            ->leftJoin('con_group as cg', 'c.uid', '=', 'cg.cuid')
            ->leftJoin('contactgroups as cgroups', 'cg.groupuid', '=', 'cgroups.uid')
            ->select('c.uid', 'c.company', 'c.alias', 'c.firstname', 'c.lastname', 'cg.groupuid', 'cgroups.name as grpname')
            ->where('c.company', '>', '')
            ->where('c.archive', 0)
            ->where('cgroups.name', 'WeShare Customer')
            ->orderBy('c.uid', 'asc')
            ->get();
        
        foreach($contacts as $contact) {
            // if(empty($contact->company) && empty($contact->alias) && empty($contact->firstname) && empty($contact->lastname)){
            //     continue;
            // }
            // if(strtolower($contact->grpname) != 'customer') {
            //     $filteredArr = array_filter($customers,  function($cust) use($contact){ 
            //         return $cust->uid == $contact->uid;
            //     });
            //     if(!empty($filteredArr)) {
            //         $customers = array_filter($customers,  function($cust) use($contact){ 
            //             return $cust->uid != $contact->uid;
            //         });
            //     }
            // } else {
                $customers[] = $contact;
            //}
        }

        return Inertia::render('BulkUpload', [
            "customers" => $customers
        ]); 
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'file'  => 'required|mimes:csv,txt,xls,xlsx',
            'customer_id' => 'required'
        ]);

        $path = $request->file('file')->store(
            'imports/', 'public'
        );

        //$path = $request->file('file')->getRealPath();
        $path = public_path('storage/'.$path);
        
        $import = new SitesImport($request->customer_id);
        Excel::import($import, $path);

        unlink($path);

        $unsuccessful = [];
        foreach ($import->failures() as $failure) {
            $record = $failure->values();
            $record['errors'] = join(", ", $failure->errors());
            $unsuccessful[] = $record;
       }

       $request->session()->put('unsuccessful', $unsuccessful);

        return response()->json([
            "successful" => $import->records,
            "unsuccessful" => $unsuccessful,
        ]);
    }

    public function export(Request $request)
    {
        $data = $request->session()->pull('unsuccessful', []);
        $export = new UnsuccessfulSitesExport($data);

        return Excel::download($export, 'Bulk Upload - Tabellenblatt1 - Unsuccessful.xlsx');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
