import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfileSummary } from "./ProfileSummary";

describe("ProfileSummary", () => {
  it("shows the name and email", () => {
    render(<ProfileSummary name="Ada Lovelace" email="ada@example.com" photoUrl={null} />);
    expect(screen.getByRole("heading", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("falls back to the email when the name is missing", () => {
    render(<ProfileSummary name={null} email="ada@example.com" photoUrl={null} />);
    expect(screen.getByRole("heading", { name: "ada@example.com" })).toBeInTheDocument();
  });

  it("shows initials when there is no photo", () => {
    render(<ProfileSummary name="Ada Lovelace" email="ada@example.com" photoUrl={null} />);
    expect(screen.getByTestId("avatar-initials")).toHaveTextContent("AL");
  });

  it("switches to initials when the photo fails to load", () => {
    const { container } = render(
      <ProfileSummary name="Ada Lovelace" email="ada@example.com" photoUrl="https://example.com/a.png" />,
    );
    fireEvent.error(container.querySelector("img")!);
    expect(screen.getByTestId("avatar-initials")).toHaveTextContent("AL");
  });
});
