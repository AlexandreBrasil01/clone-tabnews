import bcryptjs from "bcryptjs";

async function hash(password) {
  password = password + toString(process.env.PEPPER_SECRET);
  const rounds = getNumberOfRounds();
  return await bcryptjs.hash(password, rounds);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

async function compare(providedPassword, hashedPassword) {
  providedPassword = providedPassword + toString(process.env.PEPPER_SECRET);
  return await bcryptjs.compare(providedPassword, hashedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
