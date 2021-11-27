import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

test("renders referencing form", () => {
  render(<App />);
  const header = screen.getByRole("banner");
  expect(header).toBeInTheDocument();
  expect(header).toHaveTextContent("Referencing form");

  // personal data
  expect(screen.getByText(/first name/i)).toBeInTheDocument();
  expect(
    screen.getByRole("textbox", { name: /first name/i })
  ).toBeInTheDocument();

  expect(screen.getByText(/last name/i)).toBeInTheDocument();
  expect(
    screen.getByRole("textbox", { name: /last name/i })
  ).toBeInTheDocument();

  expect(screen.getByText(/current address/i)).toBeInTheDocument();
  expect(
    screen.getByRole("textbox", { name: /current address/i })
  ).toBeInTheDocument();

  // current employer
  expect(screen.getByText(/employer name/i)).toBeInTheDocument();
  expect(
    screen.getByRole("textbox", { name: /employer name/i })
  ).toBeInTheDocument();

  expect(screen.getByText(/start date/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();

  expect(screen.getByText(/end date/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
});

test("shows an error if submiting incomplete form", () => {
  render(<App />);

  const firstName = screen.getByRole("textbox", { name: /first name/i });
  const lastName = screen.getByRole("textbox", { name: /last name/i });
  const currentAddress = screen.getByRole("textbox", {
    name: /current address/i,
  });
  const submitButton = screen.getByRole("button", { name: /submit/i });

  userEvent.clear(firstName);
  userEvent.type(firstName, "edu");

  userEvent.clear(lastName);
  userEvent.type(lastName, "romo");

  userEvent.clear(currentAddress);
  userEvent.type(currentAddress, "Madrid");

  userEvent.click(submitButton);

  const alert = screen.getByRole("alert");
  expect(alert).toBeInTheDocument();
  expect(alert).toHaveTextContent("Error");
});

test("shows an error if submiting one employer with less than 3 years of duration", () => {
  render(<App />);

  const firstName = screen.getByRole("textbox", { name: /first name/i });
  const lastName = screen.getByRole("textbox", { name: /last name/i });
  const currentAddress = screen.getByRole("textbox", {
    name: /current address/i,
  });
  const submitButton = screen.getByRole("button", { name: /submit/i });

  userEvent.clear(firstName);
  userEvent.type(firstName, "edu");

  userEvent.clear(lastName);
  userEvent.type(lastName, "romo");

  userEvent.clear(currentAddress);
  userEvent.type(currentAddress, "Madrid");

  const employerName = screen.getByRole("textbox", { name: /employer name/i });
  const startDate = screen.getByLabelText(/start date/i);
  const endDate = screen.getByLabelText(/end date/i);

  userEvent.clear(employerName);
  userEvent.type(employerName, "romo corp");

  userEvent.clear(startDate);
  userEvent.type(startDate, "2023-03-21");

  userEvent.clear(endDate);
  userEvent.type(endDate, "2023-08-21");

  userEvent.click(submitButton);

  const alert = screen.getByRole("alert");
  expect(alert).toBeInTheDocument();
  expect(alert).toHaveTextContent("Error");
});

test("shows success message if submiting correct data", async () => {
  render(<App />);

  const firstName = screen.getByRole("textbox", { name: /first name/i });
  const lastName = screen.getByRole("textbox", { name: /last name/i });
  const currentAddress = screen.getByRole("textbox", {
    name: /current address/i,
  });
  const submitButton = screen.getByRole("button", { name: /submit/i });

  userEvent.clear(firstName);
  userEvent.type(firstName, "edu");

  userEvent.clear(lastName);
  userEvent.type(lastName, "romo");

  userEvent.clear(currentAddress);
  userEvent.type(currentAddress, "Madrid");

  // fill employer data
  const employerName = screen.getByRole("textbox", { name: /employer name/i });
  const startDate = screen.getByLabelText(/start date/i);
  const endDate = screen.getByLabelText(/end date/i);

  userEvent.clear(employerName);
  userEvent.type(employerName, "romo corp");

  userEvent.clear(startDate);
  userEvent.type(startDate, "2018-03-21");

  userEvent.clear(endDate);
  userEvent.type(endDate, "2023-03-21");

  await userEvent.click(submitButton);

  const alert = screen.queryByRole("alert");
  expect(alert).not.toBeInTheDocument();

  const loader = screen.queryByText(/loading/i);
  expect(loader).toBeInTheDocument();

  await waitForElementToBeRemoved(
    () => [...screen.queryAllByText(/loading/i)],
    { timeout: 4000 }
  );

  const successMessage = screen.getByText("Form successfully submited");

  expect(successMessage).toBeInTheDocument();
});
