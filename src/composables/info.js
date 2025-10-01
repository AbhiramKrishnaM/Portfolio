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
    // reference to the portfolio website github repo
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

  const testimonials = ref([
    {
      name: "Noel Jose TP",
      designation: "Software Engineer at Dicern Security",
      text: "Working with Abhiram has been a great experience. He’s passionate, always thinking ahead, and incredibly dependable when it comes to solving problems. His ability to architect solutions and guide through them makes even complex tasks feel straightforward.",
      image: "https://via.placeholder.com/150",
    },

    {
      name: "Libin Mathew Varghese",
      designation: "Software Engineer at Discern Security",
      text: "",
      image: "https://via.placeholder.com/150",
      show: true,
    },

    {
      name: "Fasil Karimban Kuzhiyil",
      designation: "CEO at IOCOD Infotech",
      text: "",
      image: "https://via.placeholder.com/150",
      show: true,
    },

    {
      name: "Harikrishnan PP",
      designation: "Frontend Developer at IOCOD Infotech",
      text: "",
      image: "https://via.placeholder.com/150",
      show: true,
    },

    {
      name: "Mujeeb Parambath",
      designation: "Software Development Manager at Tenneco Inc",
      text: "",
      image: "https://via.placeholder.com/150",
      show: true,
    },

    {
      name: "Rohan Puri",
      designation: "CTO at Discern Security",
      text: "",
      image: "https://via.placeholder.com/150",
      show: true,
    },

    {
      name: "Yahya Luqman",
      designation: "Software Development Manager at National Group",
      text: "",
      image: "https://via.placeholder.com/150",
      show: true,
    },

    {
      name: "David Mundackal",
      designation: "Software Engineer at IOCOD Infotech",
      text: "",
      image: "https://via.placeholder.com/150",
      show: true,
    },
  ]);

  return {
    landing,
    footer,
    testimonials,
  };
}
