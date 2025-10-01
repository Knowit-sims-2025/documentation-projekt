/**
 * Hämtar information om den för närvarande inloggade användaren.
 *
 * OBS: Detta är en platshållare. I en riktig applikation skulle denna funktion
 * hämta användarinformation från t.ex. localStorage, en cookie, eller ett API-anrop.
 *
 * @returns Ett objekt med den inloggade användarens information, eller null om ingen är inloggad.
 */

export const getCurrentUser = (): { name: string } | null => {
  // För nu, returnera en hårdkodad användare för demonstration.
  return { name: "Tony Stark" };
};
