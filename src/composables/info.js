import { ref } from "vue";

export function useInfo() {
  const landing = ref({
    informalGreeting: "Hey there!",
    name: "Abhiram Krishna M",
    designation: "Full Stack Developer",
    li: [
      "complete the game to continue",
      "you can also see it on my github page",
    ],
    // reference to the portfolio website
    github: "https://github.com/example/url",
  });

  return {
    landing,
  };
}
