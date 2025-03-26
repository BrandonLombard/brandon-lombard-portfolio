const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

module.exports = (dbConnection) => {
    if (!dbConnection || typeof dbConnection.model !== 'function') {
        throw new Error("❌ Database connection is invalid. Ensure `ehrDB` is correctly imported.");
    }

    const userSchema = new mongoose.Schema({
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        firstname: String,
        lastname: String,
    });

    // Hash password before saving
    userSchema.pre('save', async function (next) {
        if (!this.isModified('password')) return next();
        this.password = await bcrypt.hash(this.password, 10);
        next();
    });

    // Compare password method
    userSchema.methods.comparePassword = async function (password) {
        return bcrypt.compare(password, this.password);
    };

    // ✅ Correctly create the model using `dbConnection`
    return dbConnection.model('User', userSchema);
};
