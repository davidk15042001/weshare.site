<?php



function generateTransactionCode()
{
    return 'TXN-' . strtoupper(uniqid()) . '-' . mt_rand(1000, 9999);
}
