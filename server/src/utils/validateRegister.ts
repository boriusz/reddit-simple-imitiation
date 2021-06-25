import { UsernamePasswordInput } from "./UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ];
  }

  if (options.username.includes("@")) {
    return [{ field: "username", message: "cannot include an @" }];
  }

  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "length needs to be greater than 2 ",
      },
    ];
  }

  if (options.password.length <= 2) {
    return [
      {
        field: "password",
        message: "password length needs to be greater than 3",
      },
    ];
  }

  return null;
};
