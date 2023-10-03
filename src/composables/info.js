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

  const footer = ref({
    linkText: "Find me",
    li: [
      {
        id: 0,
        name: "Twitter",
        url: "https://twitter-url",
        icon: "twitter",
      },
      {
        id: 1,
        name: "Linkedin",
        url: "https://linkedin-url",
        icon: "linkedin",
      },
    ],

    github: {
      username: "Abhiram Krishna M",
      url: "http://github.com",
      icon: "github",
    },
  });

  return {
    landing,
    footer,
  };
}
