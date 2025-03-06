/*
  # Remove Wallet System Tables
  
  This migration removes all wallet and payment-related tables from the database.
  
  1. Tables to Remove:
    - wallets
    - wallet_transactions
    - payment_gateways
    - platform_settings (wallet settings)
*/

-- Drop wallet transactions first (due to foreign key constraints)
DROP TABLE IF EXISTS public.wallet_transactions;

-- Drop wallets table
DROP TABLE IF EXISTS public.wallets;

-- Drop payment gateways table
DROP TABLE IF EXISTS public.payment_gateways;

-- Remove wallet settings from platform_settings
DELETE FROM public.platform_settings WHERE key = 'wallet_settings';