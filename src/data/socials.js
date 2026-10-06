export const EMAIL = "abhiramkrishna.8921@gmail.com";

export const SOCIALS = [
  { id: "github", text: "github", label: "GitHub", url: "https://github.com/AbhiramKrishnaM" },
  { id: "linkedin", text: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/in/abhiram-krishna/" },
  { id: "dinq", text: "dinq", label: "dinq", url: "https://dinq.me/abhiramkrishna" },
  { id: "email", text: "email", label: "Email", url: `mailto:${EMAIL}` },
];

export const social = (id) => SOCIALS.find((s) => s.id === id);
