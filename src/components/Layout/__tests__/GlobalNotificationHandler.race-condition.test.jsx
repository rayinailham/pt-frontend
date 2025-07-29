import { render, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import GlobalNotificationHandler from '../GlobalNotificationHandler';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/dashboard' })
  };
});

vi.mock('../../../hooks/useNotifications');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('GlobalNotificationHandler - Race Condition Tests', () => {
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
    
    renderWithRouter(<GlobalNotificationHandler />);
    
    const analysisData = {
      jobId: 'test-job-123',
      resultId: 'result-456',
      message: 'Analysis complete'
    };

    // Simulate rapid multiple events
    act(() => {
      mockOnAnalysisComplete(analysisData);
      mockOnAnalysisComplete(analysisData); // Duplicate event
      mockOnAnalysisComplete(analysisData); // Another duplicate
    });

    // Fast-forward timers
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should only navigate once despite multiple events
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/results/result-456', {
        state: {
          fromNotification: true,
          jobId: 'test-job-123',
          message: 'Analysis complete'
        }
      });
    });

    vi.useRealTimers();
  });

  it('should not handle events when on AssessmentStatus page', async () => {
    vi.useFakeTimers();
    
    // Mock location to be on assessment status page
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/assessment/status/123' })
      };
    });

    renderWithRouter(<GlobalNotificationHandler />);
    
    const analysisData = {
      jobId: 'test-job-123',
      resultId: 'result-456'
    };

    // Trigger event
    act(() => {
      mockOnAnalysisComplete(analysisData);
    });

    // Fast-forward timers
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should not navigate when on assessment status page
    expect(mockNavigate).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should properly cleanup timeouts on component unmount', async () => {
    vi.useFakeTimers();
    
    const { unmount } = renderWithRouter(<GlobalNotificationHandler />);
    
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
      vi.advanceTimersByTime(1000);
    });

    // Should not navigate after unmount
    expect(mockNavigate).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should handle analysis failure and reset flags properly', async () => {
    vi.useFakeTimers();
    
    renderWithRouter(<GlobalNotificationHandler />);
    
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

    // Then trigger failure before timeout
    act(() => {
      const { onAnalysisFailed } = useNotifications.mock.calls[0][0];
      onAnalysisFailed(failureData);
    });

    // Fast-forward timers
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should not navigate due to failure clearing the timeout
    expect(mockNavigate).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should ignore events without resultId', async () => {
    vi.useFakeTimers();
    
    renderWithRouter(<GlobalNotificationHandler />);
    
    const invalidData = {
      jobId: 'test-job-123',
      // Missing resultId
    };

    // Trigger with invalid data
    act(() => {
      mockOnAnalysisComplete(invalidData);
    });

    // Fast-forward timers
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should not navigate
    expect(mockNavigate).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
