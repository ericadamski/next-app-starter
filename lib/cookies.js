import cookies from "js-cookie";

export const AUTH_COOKIE =
  process.env.NEXT_PUBLIC_USER_COOKIE_NAME ?? "nxt_auth";

export const getUserFromCookie = () => {
  const cookie = cookies.get(AUTH_COOKIE);

  if (!cookie) return;

  return JSON.parse(cookie);
};

export const setUserCookie = (user) => {
  const userObject = {
    id: user.uid,
    email: user.email,
    displayName: user.displayName,
    photo: user.photoURL,
    // TODO: add token?
  };

  cookies.set("authed", true, { expires: 1 / 24 });
  cookies.set(AUTH_COOKIE, userObject, { expires: 1 / 24 });

  return userObject;
};

export const removeUserCookies = () => {
  cookies.remove(AUTH_COOKIE);
  cookies.remove("authed");
};
