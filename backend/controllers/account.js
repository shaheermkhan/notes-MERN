const Account = require('../models/account')
const Note = require('../models/notes')
const mongoose = require('mongoose')
const { randomBytes, scrypt: scryptCallback, timingSafeEqual } = require('node:crypto')
const { promisify } = require('node:util')

const scrypt = promisify(scryptCallback)

const hashPassword = async (password) => {
    const salt = randomBytes(16).toString('hex')
    const derivedKey = await scrypt(password, salt, 64)
    return `${salt}:${derivedKey.toString('hex')}`
}

const verifyPassword = async (password, storedPassword) => {
    const [salt, storedHash] = storedPassword.split(':')

    if (!salt || !storedHash || !/^[a-f\d]{128}$/i.test(storedHash)) {
        return false
    }

    const derivedKey = await scrypt(password, salt, 64)
    const expectedHash = Buffer.from(storedHash, 'hex')

    return derivedKey.length === expectedHash.length && timingSafeEqual(derivedKey, expectedHash)
}

const login = async (req, res) => {
    const { username, password } = req.body || {}

    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password) {
        return res.status(400).json({ error: 'Username and password are required' })
    }

    try {
        const account = await Account.findOne({ username: username.trim() })

        if (!account || !await verifyPassword(password, account.password)) {
            return res.status(401).json({ error: 'Invalid username or password' })
        }

        return res.status(200).json({
            user: {
                id: account._id,
                username: account.username
            }
        })
    } catch (error) {
        return res.status(500).json({ error: 'Unable to log in' })
    }
}

const register = async (req, res) => {
    const { username, password } = req.body || {}
    const normalizedUsername = typeof username === 'string' ? username.trim() : ''

    if (!normalizedUsername || typeof password !== 'string') {
        return res.status(400).json({ error: 'Username and password are required' })
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' })
    }

    try {
        const hashedPassword = await hashPassword(password)
        const account = await Account.create({ username: normalizedUsername, password: hashedPassword })

        return res.status(201).json({
            user: {
                id: account._id,
                username: account.username
            }
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Username is already taken' })
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message })
        }

        return res.status(500).json({ error: 'Unable to register user' })
    }
}

const deleteAccount = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid account ID' })
    }

    try {
        const account = await Account.findByIdAndDelete(id)

        if (!account) {
            return res.status(404).json({ error: 'Account not found' })
        }

        await Note.deleteMany({ user: String(account._id) })
        return res.status(200).json({ message: 'Account and its notes deleted' })
    } catch (error) {
        return res.status(500).json({ error: 'Unable to delete account' })
    }
}

module.exports = { login, register, deleteAccount }