/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ErrorBoundary } from './app/ErrorBoundary';
import { ThemeProvider } from './app/ThemeContext';
import { AuthProvider } from './app/AuthContext';
import { NotificationProvider } from './app/NotificationContext';
import { ToastProvider } from './components/ui/Toast';
import { AppRouter } from './app/Router';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ToastProvider>
              <AppRouter />
            </ToastProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
