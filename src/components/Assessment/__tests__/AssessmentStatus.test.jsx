import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AssessmentStatus from '../AssessmentStatus';
import apiService from '../../../services/apiService';
import { useNotifications } from '../../../hooks/useNotifications';

// Mock dependencies
vi.mock('../../../services/apiService');
vi.mock('../../../hooks/useNotifications');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ jobId: 'test-job-123' }),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: { fromSubmission: true } })
  };
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AssessmentStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    apiService.getAssessmentStatus.mockResolvedValue({
      success: true,
      data: { status: 'processing' }
    });
    
    useNotifications.mockReturnValue({
      isConnected: true,
      isAuthenticated: true
    });
  });

  test('shows connection status indicator', async () => {
    renderWithRouter(<AssessmentStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('Real-time updates active')).toBeInTheDocument();
    });
  });

  test('shows backup monitoring when WebSocket is disconnected', async () => {
    useNotifications.mockReturnValue({
      isConnected: false,
      isAuthenticated: false
    });
    
    renderWithRouter(<AssessmentStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('Using backup monitoring')).toBeInTheDocument();
    });
  });

  test('handles WebSocket analysis complete notification', async () => {
    const mockNavigate = vi.fn();
    const mockOnAnalysisComplete = vi.fn();
    
    useNotifications.mockImplementation(({ onAnalysisComplete }) => {
      mockOnAnalysisComplete.mockImplementation(onAnalysisComplete);
      return {
        isConnected: true,
        isAuthenticated: true
      };
    });
    
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate
      };
    });
    
    renderWithRouter(<AssessmentStatus />);
    
    // Simulate WebSocket notification
    act(() => {
      mockOnAnalysisComplete({
        jobId: 'test-job-123',
        resultId: 'result-456'
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText(/preparing/i)).toBeInTheDocument();
    });
  });

  test('starts fallback polling when WebSocket fails', async () => {
    vi.useFakeTimers();
    
    useNotifications.mockReturnValue({
      isConnected: false,
      isAuthenticated: false
    });
    
    apiService.getAssessmentStatus
      .mockResolvedValueOnce({
        success: true,
        data: { status: 'processing' }
      })
      .mockResolvedValueOnce({
        success: true,
        data: { status: 'completed', resultId: 'result-456' }
      });
    
    renderWithRouter(<AssessmentStatus />);
    
    // Wait for component to mount and start analyzing stage
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    
    // Advance time to trigger polling
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    
    expect(apiService.getAssessmentStatus).toHaveBeenCalledTimes(2);
    
    vi.useRealTimers();
  });

  test('shows debug info in development mode', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    renderWithRouter(<AssessmentStatus />);
    
    await waitFor(() => {
      expect(screen.getByText('Debug Info')).toBeInTheDocument();
    });
    
    process.env.NODE_ENV = originalEnv;
  });

  test('handles analysis failure notification', async () => {
    const mockOnAnalysisFailed = vi.fn();
    
    useNotifications.mockImplementation(({ onAnalysisFailed }) => {
      mockOnAnalysisFailed.mockImplementation(onAnalysisFailed);
      return {
        isConnected: true,
        isAuthenticated: true
      };
    });
    
    renderWithRouter(<AssessmentStatus />);
    
    // Simulate failure notification
    act(() => {
      mockOnAnalysisFailed({
        jobId: 'test-job-123',
        message: 'Analysis failed due to server error'
      });
    });
    
    await waitFor(() => {
      expect(screen.getByText('Analysis failed due to server error')).toBeInTheDocument();
    });
  });
});
