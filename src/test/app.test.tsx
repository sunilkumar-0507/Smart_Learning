import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/App';
import { useAppStore } from '@/store/appStore';
import { createEmptyData } from '@/data/seed';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useAppStore.setState(createEmptyData());
});

describe('application flows', () => {
  it('redirects to the landing page when no profile exists', async () => {
    renderAt('/dashboard');
    expect(await screen.findByRole('heading', { name: /know exactly what to study next/i })).toBeInTheDocument();
  });

  it('loads the demo student and shows a data-driven dashboard', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getAllByRole('button', { name: /explore demo student/i })[0]);
    expect(await screen.findByRole('heading', { name: /welcome back, aarav/i }, { timeout: 8000 })).toBeInTheDocument();
    const state = useAppStore.getState();
    expect(state.results.length).toBeGreaterThan(0);
    expect(screen.getByText('Enrolled subjects').parentElement).toHaveTextContent(String(state.subjects.length));
  });

  it('creates a profile through the onboarding form with validation', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(screen.getAllByRole('button', { name: /get started/i })[0]);
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /create profile/i }));
    expect(within(dialog).getByText(/enter your name/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/valid email/i)).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText(/full name/i), 'Priya Nair');
    await user.type(within(dialog).getByLabelText(/^email/i), 'priya@example.edu');
    await user.click(within(dialog).getByRole('button', { name: /create profile/i }));
    expect(await screen.findByRole('heading', { name: /welcome back, priya/i }, { timeout: 8000 })).toBeInTheDocument();
    expect(useAppStore.getState().profile?.email).toBe('priya@example.edu');
  });

  it('prevents incomplete assessment submissions and records completed ones', async () => {
    const user = userEvent.setup();
    useAppStore.getState().createProfile({ name: 'Test Student', email: 't@example.edu', interests: [], educationLevel: 'Undergraduate', dailyStudyMinutes: 60, learningGoals: '' });
    renderAt('/assessment/web-html');
    expect(await screen.findByRole('heading', { name: /html fundamentals assessment/i }, { timeout: 8000 })).toBeInTheDocument();

    // Jump to the last question without answering: submit is disabled.
    await user.click(screen.getByRole('button', { name: 'Question 5' }));
    expect(screen.getByRole('button', { name: /submit assessment/i })).toBeDisabled();

    const topic = useAppStore.getState().topics.find((t) => t.id === 'web-html')!;
    for (let i = 0; i < topic.questions.length; i += 1) {
      await user.click(screen.getByRole('button', { name: new RegExp(`^Question ${i + 1}`) }));
      const correct = topic.questions[i].options[topic.questions[i].correctIndex];
      await user.click(screen.getByRole('radio', { name: new RegExp(correct.replace(/[.*+?^${}()|[\]\\<>]/g, '\\$&')) }));
    }
    await user.click(screen.getByRole('button', { name: /submit assessment/i }));
    expect(await screen.findByText('100%')).toBeInTheDocument();
    expect(screen.getByText(/answer review/i)).toBeInTheDocument();
    const { results, activities } = useAppStore.getState();
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ topicId: 'web-html', score: 100 });
    expect(activities.some((a) => a.type === 'assessment')).toBe(true);
  });

  it('shows a not-found page for unknown routes', async () => {
    renderAt('/does-not-exist');
    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });
});
