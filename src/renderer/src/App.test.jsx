import { test, expect } from "vitest";
import { render } from "@testing-library/react";
import { format } from "date-fns";
import App from "./App.jsx";

test("renders the day of the month", () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(format(new Date(), "d"));
  expect(linkElement).toBeInTheDocument();
});

test("renders the month", () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(format(new Date(), "MMM"));
  expect(linkElement).toBeInTheDocument();
});

test("renders the year", () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(format(new Date(), "y"));
  expect(linkElement).toBeInTheDocument();
});

test("renders the weekday", () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(format(new Date(), "EEEE"));
  expect(linkElement).toBeInTheDocument();
});
