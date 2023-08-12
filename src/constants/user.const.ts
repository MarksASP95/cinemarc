export const USERNAME_REGEX = /^([a-zA-Z])*([_\d])*([a-zA-Z])+([_\d])*$/g;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 16;
export const PASSWORD_MIN_LENGTH = 8;

export const checkUsername = (username: string): string | null => {
  if (username.length < USERNAME_MIN_LENGTH) 
    return `Username must have at least ${USERNAME_MIN_LENGTH} characters`;
  if (username.length > USERNAME_MAX_LENGTH) 
    return `Username must have up to ${USERNAME_MAX_LENGTH} characters`;

  const matchesRegex = !!username.match(USERNAME_REGEX);

  if (!matchesRegex)
    return "Username not valid";

  return null;
}

export const checkPassword = (password: string): string | null => {
  if (password.length < PASSWORD_MIN_LENGTH) 
    return `Password must have at least ${PASSWORD_MIN_LENGTH} characters`;

  return null;
}