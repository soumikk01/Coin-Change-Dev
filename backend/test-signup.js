const mongoose = require('mongoose');
const User = require('./models/user.model');

async function testSignup() {
    try {
        // Connect to MongoDB
        await mongoose.connect(
            "mongodb+srv://soumikb0001_db_user:DX9Nak8JMDOkGaCF@cluster0.ogsx2gt.mongodb.net/coinchanger?retryWrites=true&w=majority&appName=Cluster0"
        );
        console.log('✅ MongoDB Connected');

        // Try to create a user
        const user = await User.create({
            name: 'Test User',
            email: 'newtest@example.com',
            password: 'password123'
        });

        console.log('✅ User created successfully:', {
            id: user._id,
            name: user.name,
            email: user.email
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

testSignup();
