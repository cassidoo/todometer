import { test, expect, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { format } from "date-fns";
import App from "./App.jsx";

beforeEach(() => {
	localStorage.clear();
});

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

test("clicking item name enters inline edit mode", () => {
	const { getByPlaceholderText, getByText, getByDisplayValue } = render(
		<App />,
	);
	const addInput = getByPlaceholderText("Add new item");

	fireEvent.change(addInput, { target: { value: "Original task" } });
	fireEvent.submit(addInput.closest("form"));

	fireEvent.click(getByText("Original task"));

	expect(getByDisplayValue("Original task")).toBeInTheDocument();
});

test("pressing enter commits inline edits", () => {
	const {
		getByPlaceholderText,
		getByText,
		getByDisplayValue,
		queryByDisplayValue,
	} = render(<App />);
	const addInput = getByPlaceholderText("Add new item");

	fireEvent.change(addInput, { target: { value: "Original task" } });
	fireEvent.submit(addInput.closest("form"));

	fireEvent.click(getByText("Original task"));
	const editInput = getByDisplayValue("Original task");
	fireEvent.change(editInput, { target: { value: "Updated task" } });
	fireEvent.keyDown(editInput, { key: "Enter", code: "Enter" });

	expect(getByText("Updated task")).toBeInTheDocument();
	expect(queryByDisplayValue("Updated task")).not.toBeInTheDocument();
});

test("blurring inline edit commits changes", () => {
	const {
		getByPlaceholderText,
		getByText,
		getByDisplayValue,
		queryByDisplayValue,
	} = render(<App />);
	const addInput = getByPlaceholderText("Add new item");

	fireEvent.change(addInput, { target: { value: "Blur me" } });
	fireEvent.submit(addInput.closest("form"));

	fireEvent.click(getByText("Blur me"));
	const editInput = getByDisplayValue("Blur me");
	fireEvent.change(editInput, { target: { value: "Blur saved" } });
	fireEvent.blur(editInput);

	expect(getByText("Blur saved")).toBeInTheDocument();
	expect(queryByDisplayValue("Blur saved")).not.toBeInTheDocument();
});

test("empty inline edit reverts to previous value", () => {
	const { getByPlaceholderText, getByText, getByDisplayValue } = render(
		<App />,
	);
	const addInput = getByPlaceholderText("Add new item");

	fireEvent.change(addInput, { target: { value: "Keep me" } });
	fireEvent.submit(addInput.closest("form"));

	fireEvent.click(getByText("Keep me"));
	const editInput = getByDisplayValue("Keep me");
	fireEvent.change(editInput, { target: { value: "   " } });
	fireEvent.keyDown(editInput, { key: "Enter", code: "Enter" });

	expect(getByText("Keep me")).toBeInTheDocument();
});

test("multiline todo keeps line breaks and can be edited", () => {
	localStorage.setItem(
		"state",
		JSON.stringify({
			items: [{ text: "Line one\nLine two", key: 123, status: "pending" }],
			date: {
				day: format(new Date(), "dd"),
				dayDisplay: format(new Date(), "d"),
				month: format(new Date(), "MM"),
				monthDisplay: format(new Date(), "MMM"),
				year: format(new Date(), "y"),
				weekday: format(new Date(), "EEEE"),
			},
		}),
	);

	const { getByText, getByDisplayValue } = render(<App />);
	const multilineItem = getByText(/Line one\s+Line two/);

	expect(multilineItem).toBeInTheDocument();

	fireEvent.click(multilineItem);
	expect(getByDisplayValue(/Line one\s+Line two/)).toBeInTheDocument();
});

test("keyboard navigation enters item controls in order", () => {
	const { getByPlaceholderText, getByText, getByDisplayValue } = render(
		<App />,
	);
	const addInput = getByPlaceholderText("Add new item");

	fireEvent.change(addInput, { target: { value: "Keyboard task" } });
	fireEvent.submit(addInput.closest("form"));

	const itemnameButton = getByText("Keyboard task");
	const itemRoot = itemnameButton.closest('div[tabindex="0"]');

	expect(itemnameButton.tagName).toBe("BUTTON");

	itemRoot.focus();
	fireEvent.keyDown(itemRoot, { key: "Enter", code: "Enter" });
	expect(document.activeElement).toBe(itemnameButton);

	fireEvent.click(itemnameButton);
	expect(getByDisplayValue("Keyboard task")).toBeInTheDocument();
});
