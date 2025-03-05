
import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Auth Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Client Pages
import ClientDashboard from '@/pages/ClientDashboard';
import ClientAssignments from '@/pages/ClientAssignments';
import ClientAssignmentDetails from '@/pages/ClientAssignmentDetails';
import ClientNewAssignment from '@/pages/ClientNewAssignment';
import ClientProfile from '@/pages/ClientProfile';
import ClientSettings from '@/pages/ClientSettings';
import ClientWallet from '@/pages/ClientWallet';

// Writer Pages
import WriterDashboard from '@/pages/WriterDashboard';
import WriterAssignments from '@/pages/WriterAssignments';
import WriterAssignmentDetails from '@/pages/WriterAssignmentDetails';
import WriterProfile from '@/pages/WriterProfile';
import WriterSettings from '@/pages/WriterSettings';

// Admin Pages
import AdminDashboard from '@/pages/AdminDashboard';
import AdminAssignments from '@/pages/AdminAssignments';
import AdminAssignmentDetails from '@/pages/AdminAssignmentDetails';
import AdminUsers from '@/pages/AdminUsers';
import AdminUserDetails from '@/pages/AdminUserDetails';
import AdminSettings from '@/pages/AdminSettings';

// Setting Pages
import GeneralSettings from '@/pages/GeneralSettings';
import SecuritySettings from '@/pages/SecuritySettings';
import PaymentSettings from '@/pages/PaymentSettings';
import OrganizationSettings from '@/pages/OrganizationSettings';
import UserManagement from '@/pages/UserManagement';
import AssignmentSettings from '@/pages/AssignmentSettings';
import WalletSettingsPage from '@/pages/WalletSettingsPage';

// Public Pages
import Landing from '@/pages/Landing';
import PricingPage from '@/pages/PricingPage';
import AboutPage from '@/pages/AboutPage';
import ServicesPage from '@/pages/ServicesPage';
import ContactPage from '@/pages/ContactPage';
import OrderPage from '@/pages/OrderPage';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/pricing',
    element: <PricingPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/services',
    element: <ServicesPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/order',
    element: <OrderPage />,
  },

  // Client Routes
  {
    path: '/client',
    element: <ClientDashboard />,
  },
  {
    path: '/client/assignments',
    element: <ClientAssignments />,
  },
  {
    path: '/client/assignments/:id',
    element: <ClientAssignmentDetails />,
  },
  {
    path: '/client/new-assignment',
    element: <ClientNewAssignment />,
  },
  {
    path: '/client/account',
    element: <ClientProfile />,
  },
  {
    path: '/client/settings',
    element: <ClientSettings />,
  },
  {
    path: '/client/wallet',
    element: <ClientWallet />,
  },

  // Writer Routes
  {
    path: '/writer',
    element: <WriterDashboard />,
  },
  {
    path: '/writer/assignments',
    element: <WriterAssignments />,
  },
  {
    path: '/writer/assignments/:id',
    element: <WriterAssignmentDetails />,
  },
  {
    path: '/writer/account',
    element: <WriterProfile />,
  },
  {
    path: '/writer/settings',
    element: <WriterSettings />,
  },

  // Admin Routes
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/assignments',
    element: <AdminAssignments />,
  },
  {
    path: '/admin/assignments/:id',
    element: <AdminAssignmentDetails />,
  },
  {
    path: '/admin/users',
    element: <AdminUsers />,
  },
  {
    path: '/admin/users/:id',
    element: <AdminUserDetails />,
  },
  {
    path: '/admin/settings',
    element: <AdminSettings />,
  },

  // Settings Routes
  {
    path: '/settings/general',
    element: <GeneralSettings />,
  },
  {
    path: '/settings/security',
    element: <SecuritySettings />,
  },
  {
    path: '/settings/payment',
    element: <PaymentSettings />,
  },
  {
    path: '/settings/organization',
    element: <OrganizationSettings />,
  },
  {
    path: '/settings/users',
    element: <UserManagement />,
  },
  {
    path: '/settings/assignments',
    element: <AssignmentSettings />,
  },
  {
    path: '/settings/wallet',
    element: <WalletSettingsPage />,
  },

  // Catch-all route
  {
    path: '*',
    element: <NotFound />,
  },
]);
