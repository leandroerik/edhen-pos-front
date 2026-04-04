import { render, screen } from '@testing-library/react';
import App from './App';

test('renders navbar with Edhen POS title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Edhen POS/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders navigation links', () => {
  render(<App />);
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Sales/i)).toBeInTheDocument();
  expect(screen.getByText(/Clients/i)).toBeInTheDocument();
  expect(screen.getByText(/Products/i)).toBeInTheDocument();
  expect(screen.getByText(/Reports/i)).toBeInTheDocument();
});
