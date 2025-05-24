const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection URI
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://riziqzhapran:crpDNd7mxPjfEAq6@nicwaproject.ouf6c8q.mongodb.net/?retryWrites=true&w=majority&appName=Nicwaproject';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Define schema for RSVP entries
const rsvpSchema = new mongoose.Schema({
    name: String,
    message: String,
    attendance: String,
    timestamp: { type: Date, default: Date.now }
});

// Create model for RSVP entries
const RSVP = mongoose.model('RSVP', rsvpSchema, 'fajrulLaeli'); // Sesuaikan nama collection

// Endpoint untuk mengirim data RSVP
app.post('/rsvp', async (req, res) => {
    try {
        const { name, message, attendance } = req.body;

        // Cek apakah ada RSVP dengan nama dan pesan yang sama
        const existingRSVP = await RSVP.findOne({ name, message });
        if (existingRSVP) {
            return res.status(400).json({ error: 'Duplicate RSVP entry' });
        }

        // Jika tidak ada duplikat, buat RSVP baru
        const newRSVP = new RSVP({ name, message, attendance });
        await newRSVP.save();
        res.json({ status: 'RSVP saved!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save RSVP' });
    }
});

// Endpoint untuk mendapatkan semua pesan RSVP
app.get('/rsvp', async (req, res) => {
    try {
        const rsvps = await RSVP.find().sort({ timestamp: -1 }); // Sortir berdasarkan waktu terbaru
        res.json(rsvps);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve RSVPs' });
    }
});

// Endpoint untuk mendapatkan jumlah kehadiran
app.get('/rsvp/attendance', async (req, res) => {
    try {
        const attendanceCounts = {
            hadir: 0,
            tidakHadir: 0,
            insyaallah: 0 // tambahkan ini
        };

        const attendanceData = await RSVP.aggregate([
            {
                $group: {
                    _id: "$attendance",
                    count: { $sum: 1 }
                }
            }
        ]);

        attendanceData.forEach(item => {
            if (item._id === 'Hadir') attendanceCounts.hadir = item.count;
            if (item._id === 'Tidak Hadir') attendanceCounts.tidakHadir = item.count;
            if (item._id === 'Insyaallah') attendanceCounts.insyaallah = item.count; // tambahkan ini
        });

        res.json(attendanceCounts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve attendance data' });
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
