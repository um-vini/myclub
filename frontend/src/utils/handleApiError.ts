import axios from 'axios';
import { toast } from 'sonner';

/**
 * Standardized error handler for API requests.
 * Parses axios errors to extract backend messages, validation arrays, or display fallback alerts.
 */
export function handleApiError(error: unknown, fallbackMessage?: string) {
  let message = fallbackMessage || 'Ocorreu um erro inesperado.';

  if (axios.isAxiosError(error)) {
    const backendData = error.response?.data;

    /**
     * Validation Error Handling
     * If the backend returns an array of strings (from Zod or Sequelize validation),
     * we iterate through them and trigger individual toasts for each issue.
     */
    if (Array.isArray(backendData?.error)) {
      backendData.error.forEach((errDetail: string) => {
        // Displays each specific validation message (e.g., "Name is required")
        toast.error(errDetail);
      });

      // Log for developer debugging in the browser console
      console.error('[VALIDATION_ERRORS]:', backendData.error);
      return;
    }

    // Extract custom message from backend or use the default fallback
    message = backendData?.message || message;

    /**
     * Network Error Handling
     * Specifically identifies when the backend server is unreachable.
     */
    if (error.code === 'ERR_NETWORK') {
      message = 'Servidor offline. Verifique sua conexão com a API.';
    }
  }

  /**
   * Generic Error Display
   * Used for non-validation errors or single-message backend responses.
   */
  toast.error('Ops! Algo deu errado', {
    description: message,
  });

  // Comprehensive log of the error object for troubleshooting
  console.error('[API_ERROR]:', error);
}
