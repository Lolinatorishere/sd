const crypto = require('crypto');
const util = require('util');
const aes_password = require('../.aes_password.js').password;
const aes_salt = require('../.aes_password.js').salt;

const scrypt = util.promisify(crypto.scrypt);

async function genKey(password, salt, keylength) {
    try {
        let key = await scrypt(password, salt, keylength);
        return key
    } catch (error) {
        console.error(error);
        return false;
    }
}

exports.encrypt = (text) => {
    async function enc(text) {
        const iv = crypto.randomBytes(16);
        console.log(iv);
        let key = await genKey(aes_password, aes_salt, 32).then((key) => { return key });
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return {
            iv: iv.toString('hex'),
            encrypted: encrypted
        };
    }
    if (text === undefined) {
        return false;
    }
    return enc(text);
}

exports.decrypt = (encrypted, iv) => {
    async function dec(encrypted, iv) {
        let key = await genKey(aes_password, aes_salt, 32)
        let ivec = Buffer.from(iv, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivec);
        let decrypt_ret = decipher.update(encrypted, 'hex', 'utf8');
        decrypt_ret += decipher.final('utf8');
        return decrypt_ret;
    }
    if (encrypted === undefined || iv === undefined) {
        return false;
    }
    return dec(encrypted, iv);
}
