const mongoose = require("mongoose");
const Review = require("./review")
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

CampgroundSchema.post('findOneAndDelete', async (doc) => {
    const justDeletedObj = doc;
    if(justDeletedObj){
        await Review.deleteMany({
            _id: {
                $in : justDeletedObj.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);