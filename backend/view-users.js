const mongoose = require('mongoose');
const User = require('./models/user.model');

async function viewUsers() {
    try {
        await mongoose.connect(
            "mongodb+srv://soumikb0001_db_user:DX9Nak8JMDOkGaCF@cluster0.ogsx2gt.mongodb.net/coinchanger?retryWrites=true&w=majority&appName=Cluster0"
        );
        console.log('✅ MongoDB Connected\n');

        const users = await User.find({}).select('-password');

        console.log(`📊 Total Users: ${users.length}\n`);

        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   ID: ${user._id}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log('');
        });

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
}

viewUsers();
