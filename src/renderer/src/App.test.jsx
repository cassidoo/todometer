import { test, expect, beforeEach } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { format } from "date-fns";
import App from "./App.jsx";

beforeEach(() => {
	localStorage.clear();
	delete window.todoAPI;
});

test("renders the day of the month", async () => {
	const { getByText } = render(<App />);
	await waitFor(() => {
		expect(getByText(format(new Date(), "d"))).toBeInTheDocument();
	});
});

test("renders the month", async () => {
	const { getByText } = render(<App />);
	await waitFor(() => {
		expect(getByText(format(new Date(), "MMM"))).toBeInTheDocument();
	});
});

test("renders the year", async () => {
	const { getByText } = render(<App />);
	await waitFor(() => {
		expect(getByText(format(new Date(), "y"))).toBeInTheDocument();
	});
});

test("renders the weekday", async () => {
	const { getByText } = render(<App />);
	await waitFor(() => {
		expect(getByText(format(new Date(), "EEEE"))).toBeInTheDocument();
	});
});

test("clicking item name enters inline edit mode", async () => {
	const { getByPlaceholderText, getByText, getByDisplayValue } = render(
		<App />,
	);

	await waitFor(() => {
		expect(getByPlaceholderText("Add new item")).toBeInTheDocument();
	});

	const addInput = getByPlaceholderText("Add new item");
	fireEvent.change(addInput, { target: { value: "Original task" } });
	fireEvent.submit(addInput.closest("form"));

	fireEvent.click(getByText("Original task"));

	expect(getByDisplayValue("Original task")).toBeInTheDocument();
});

test("pressing enter commits inline edits", async () => {
	const {
		getByPlaceholderText,
		getByText,
		getByDisplayValue,
		queryByDisplayValue,
	} = render(<App />);

	await waitFor(() => {
		expect(getByPlaceholderText("Add new item")).toBeInTheDocument();
	});

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

test("blurring inline edit commits changes", async () => {
	const {
		getByPlaceholderText,
		getByText,
		getByDisplayValue,
		queryByDisplayValue,
	} = render(<App />);

	await waitFor(() => {
		expect(getByPlaceholderText("Add new item")).toBeInTheDocument();
	});

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

test("empty inline edit reverts to previous value", async () => {
	const { getByPlaceholderText, getByText, getByDisplayValue } = render(
		<App />,
	);

	await waitFor(() => {
		expect(getByPlaceholderText("Add new item")).toBeInTheDocument();
	});

	const addInput = getByPlaceholderText("Add new item");
	fireEvent.change(addInput, { target: { value: "Keep me" } });
	fireEvent.submit(addInput.closest("form"));

	fireEvent.click(getByText("Keep me"));
	const editInput = getByDisplayValue("Keep me");
	fireEvent.change(editInput, { target: { value: "   " } });
	fireEvent.keyDown(editInput, { key: "Enter", code: "Enter" });

	expect(getByText("Keep me")).toBeInTheDocument();
});

test("multiline to-do keeps line breaks and can be edited", async () => {
	localStorage.setItem(
		"state",
		JSON.stringify({
			items: [
				{ text: "Line one\nLine two", id: "test-id-123", status: "pending" },
			],
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

	await waitFor(() => {
		expect(getByText(/Line one\s+Line two/)).toBeInTheDocument();
	});

	const multilineItem = getByText(/Line one\s+Line two/);
	fireEvent.click(multilineItem);
	expect(getByDisplayValue(/Line one\s+Line two/)).toBeInTheDocument();
});

test("keyboard navigation enters item controls in order", async () => {
	const { getByPlaceholderText, getByText, getByDisplayValue } = render(
		<App />,
	);

	await waitFor(() => {
		expect(getByPlaceholderText("Add new item")).toBeInTheDocument();
	});

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
