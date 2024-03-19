require('dotenv').config()
const crypto = require('crypto')
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
const algo = 'aes-256-cbc'

// encrypt the plainText
function encrypt(plainText) {

  if (typeof plainText !== 'string') {
    throw new Error('The data argument must be of type string')
  }
  const iv = crypto.randomBytes(16)
// create a cipher object to encrypt the data using the algo, key and IV
  const cipher = crypto.createCipheriv(algo, key, iv)

// encrypt the plainText
  let encryptedText = cipher.update(plainText, 'utf8', 'hex')
  encryptedText += cipher.final('hex')
  return iv.toString('hex') + ':' + encryptedText
}

// decrypt the encrypted text
function decrypt(input) {
  const parts = input.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encryptedText = parts[1]

// decipher the text and format as utf-8 so we can read it!
  const decipher = crypto.createDecipheriv(algo, key, iv)
  let decryptedText = decipher.update(encryptedText, 'hex', 'utf-8')
  decryptedText += decipher.final('utf8')
  return decryptedText
}

const text = 'Push new files to GEM server.'
const encrypted = encrypt(text)
const decrypted = decrypt(encrypted)
console.log("encrypted text sample:", encrypted)
console.log("decrypted text sample:", decrypted)

function encryptInstruction(plainText) {

const text = 'Add instruction here'
const encrypted = encrypt(text)
const decrypted = decrypt(encrypted)
console.log("encrypted text sample:", encrypted)
console.log("decrypted text sample:", decrypted)

}
module.exports = { encrypt, decrypt }
