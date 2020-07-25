var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;
var findOrCreate = require('mongoose-findorcreate');
var membershipSchema = new Schema({
	provider: String,
	providerUserId: String,
	accessToken: String,
	userId: { type: ObjectId, ref: 'User' },
	dateAdded: { type: Date, default: Date.now }
});
membershipSchema.plugin(findOrCreate);
module.exports = mongoose.model('Membership', membershipSchema);
