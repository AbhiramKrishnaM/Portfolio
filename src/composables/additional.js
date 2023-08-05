import { ref } from "vue";

export function useAdditional() {
  const errorPage = ref({});

  const underConstructionPage = ref({
    sentences: [
      "_Hey there my name is _Abhiram krishna",
      "I am trying to create something cool🤘🏾!.",
      "Things are under _maintenance now 👨🏽‍🔧.",
    ],
  });

  return {
    errorPage,
    underConstructionPage,
  };
}
