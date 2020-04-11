// @flow

export default function getEnv(variableName: string): string {
  if (process.env.NODE_ENV === 'development' && variableName === 'API_URL') {
    // Cheat, and allow other devices on the local network connect
    return `http://${window.location.hostname}:3001`;
  }

  const fullName = `REACT_APP_${variableName}`;
  const variable = process.env[fullName];
  if (!variable)
    throw new Error(`Environment variable ${fullName} is not defined`);
  return variable;
}
