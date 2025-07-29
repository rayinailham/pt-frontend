import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ResultsTable from '../components/ResultsTable';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ResultsTable Persona Profile Compatibility', () => {
  const mockProps = {
    loading: false,
    onView: vi.fn(),
    onDelete: vi.fn(),
    onNewAssessment: vi.fn(),
    onRefresh: vi.fn(),
    deleteLoading: {}
  };

  test('displays archetype from new persona_profile structure', () => {
    const data = {
      results: [{
        id: '1',
        assessment_name: 'Test Assessment',
        created_at: '2024-01-01T00:00:00Z',
        status: 'completed',
        persona_profile: {
          archetype: 'The Analytical Innovator',
          coreMotivators: ['Problem-Solving', 'Learning & Mastery'],
          learningStyle: 'Visual & Kinesthetic',
          shortSummary: 'You are an analytical thinker...',
          careerRecommendation: [
            {
              careerName: 'Data Scientist',
              justification: 'Perfect fit for analytical skills'
            }
          ]
        }
      }]
    };

    renderWithRouter(<ResultsTable {...mockProps} data={data} />);
    
    expect(screen.getByText('The Analytical Innovator')).toBeInTheDocument();
  });

  test('displays archetype from old persona_profile structure', () => {
    const data = {
      results: [{
        id: '1',
        assessment_name: 'Test Assessment',
        created_at: '2024-01-01T00:00:00Z',
        status: 'completed',
        persona_profile: {
          archetype: 'The Creative Problem Solver'
        }
      }]
    };

    renderWithRouter(<ResultsTable {...mockProps} data={data} />);
    
    expect(screen.getByText('The Creative Problem Solver')).toBeInTheDocument();
  });

  test('handles missing persona_profile gracefully', () => {
    const data = {
      results: [{
        id: '1',
        assessment_name: 'Test Assessment',
        created_at: '2024-01-01T00:00:00Z',
        status: 'completed',
        persona_profile: null
      }]
    };

    renderWithRouter(<ResultsTable {...mockProps} data={data} />);
    
    expect(screen.getByText('No archetype')).toBeInTheDocument();
  });

  test('handles processing status correctly', () => {
    const data = {
      results: [{
        id: '1',
        assessment_name: 'Test Assessment',
        created_at: '2024-01-01T00:00:00Z',
        status: 'processing'
      }]
    };

    renderWithRouter(<ResultsTable {...mockProps} data={data} />);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  test('handles failed status correctly', () => {
    const data = {
      results: [{
        id: '1',
        assessment_name: 'Test Assessment',
        created_at: '2024-01-01T00:00:00Z',
        status: 'failed'
      }]
    };

    renderWithRouter(<ResultsTable {...mockProps} data={data} />);
    
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  test('displays archetype in mobile view', () => {
    const data = {
      results: [{
        id: '1',
        assessment_name: 'Test Assessment',
        created_at: '2024-01-01T00:00:00Z',
        status: 'completed',
        persona_profile: {
          archetype: 'The Strategic Thinker'
        }
      }]
    };

    renderWithRouter(<ResultsTable {...mockProps} data={data} />);
    
    // Should appear in both desktop and mobile views
    const archetypeElements = screen.getAllByText('The Strategic Thinker');
    expect(archetypeElements.length).toBeGreaterThan(0);
  });

  test('handles alternative persona_profile structure paths', () => {
    const data = {
      results: [{
        id: '1',
        assessment_name: 'Test Assessment',
        created_at: '2024-01-01T00:00:00Z',
        status: 'completed',
        persona_profile: {
          career_persona: {
            archetype: 'The Innovative Leader'
          }
        }
      }]
    };

    renderWithRouter(<ResultsTable {...mockProps} data={data} />);
    
    expect(screen.getByText('The Innovative Leader')).toBeInTheDocument();
  });

  test('handles very old structure with direct archetype field', () => {
    const data = {
      results: [{
        id: '1',
        assessment_name: 'Test Assessment',
        created_at: '2024-01-01T00:00:00Z',
        status: 'completed',
        archetype: 'The Legacy Archetype'
      }]
    };

    renderWithRouter(<ResultsTable {...mockProps} data={data} />);
    
    expect(screen.getByText('The Legacy Archetype')).toBeInTheDocument();
  });
});
