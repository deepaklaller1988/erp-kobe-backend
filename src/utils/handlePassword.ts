import bcrypt from 'bcryptjs';

export function encryptPassword(password: string) {
    try {
        let saltRound = process.env.SALT_ROUND;
        let salt = bcrypt.genSaltSync(Number(saltRound));
        let securedPassword = bcrypt.hashSync(password, salt);
        return { password: securedPassword, success: true };
    } catch (err) {
        return { error: err, success: false };
    }
}

export async function verifyPassword(filledPassword: string, dbPassword: string) {
    try {
        let comparePassword = await bcrypt.compare(filledPassword, dbPassword);
        return { verified: comparePassword, success: true };
    } catch (err) {
        return { error: err, success: false };
    }
}