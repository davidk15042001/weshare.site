<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterCardCovers extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('card_covers', function (Blueprint $table) {
            $table->enum('type', ['photo', 'video'])->default('photo')->after('url');
            $table->string('thumbnail')->nullable()->after('url');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('card_covers', function (Blueprint $table) {
            $table->dropColumn('cover_type');
            $table->dropColumn('thumbnail');
        });
    }
}
