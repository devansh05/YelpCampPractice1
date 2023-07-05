const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: {
        type : String,
        required : [true, 'name cannot be left blank']
    },
    price: {
        type : Number,
        required : false
    },
    image: {
        type: String,
        required: false
    },
    description: {
        type : String,
        required : false
    },
    location: {
        type : String,
        required : false
    },
    //adding reviews to campground
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
    
});

module.exports = mongoose.model('Campground', CampgroundSchema);