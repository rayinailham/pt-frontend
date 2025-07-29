import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AssessmentStatus from '../AssessmentStatus';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ jobId: 'test-job-123' }),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ state: { fromSubmission: true } })
  };
});

vi.mock('../../../hooks/useNotifications');
vi.mock('../../../services/apiService');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AssessmentStatus - Race Condition Tests', () => {
  let mockNavigate;
  let mockOnAnalysisComplete;
  let useNotifications;

  beforeEach(() => {
    mockNavigate = vi.fn();
    mockOnAnalysisComplete = vi.fn();
    
    // Import mocked modules
    useNotifications = (await import('../../../hooks/useNotifications')).useNotifications;
    
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
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  it('should prevent race conditions when multiple analysis complete events are received', async () => {
    vi.useFakeTimers();
    
    renderWithRouter(<AssessmentStatus />);
    
    const analysisData = {
      jobId: 'test-job-123',
      resultId: 'result-456'
    };

    // Simulate rapid multiple events
    act(() => {
      mockOnAnalysisComplete(analysisData);
      mockOnAnalysisComplete(analysisData); // Duplicate event
      mockOnAnalysisComplete(analysisData); // Another duplicate
    });

    // Fast-forward timers
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Should only navigate once despite multiple events
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/results/result-456');
    });

    vi.useRealTimers();
  });

  it('should properly cleanup timeouts on component unmount', async () => {
    vi.useFakeTimers();
    
    const { unmount } = renderWithRouter(<AssessmentStatus />);
    
    const analysisData = {
      jobId: 'test-job-123',
      resultId: 'result-456'
    };

    // Trigger analysis complete
    act(() => {
      mockOnAnalysisComplete(analysisData);
    });

    // Unmount before timeout completes
    unmount();

    // Fast-forward timers
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should not navigate after unmount
    expect(mockNavigate).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should handle analysis failure and reset flags properly', async () => {
    vi.useFakeTimers();
    
    renderWithRouter(<AssessmentStatus />);
    
    const analysisData = {
      jobId: 'test-job-123',
      resultId: 'result-456'
    };

    const failureData = {
      jobId: 'test-job-123',
      message: 'Analysis failed'
    };

    // First trigger success
    act(() => {
      mockOnAnalysisComplete(analysisData);
    });

    // Then trigger failure (simulating backend correction)
    act(() => {
      const { onAnalysisFailed } = useNotifications.mock.calls[0][0];
      onAnalysisFailed(failureData);
    });

    // Fast-forward timers
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Should not navigate due to failure
    expect(mockNavigate).not.toHaveBeenCalled();

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/analysis failed/i)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });

  it('should ignore events with wrong jobId', async () => {
    vi.useFakeTimers();
    
    renderWithRouter(<AssessmentStatus />);
    
    const wrongJobData = {
      jobId: 'wrong-job-456',
      resultId: 'result-456'
    };

    // Trigger with wrong jobId
    act(() => {
      mockOnAnalysisComplete(wrongJobData);
    });

    // Fast-forward timers
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
