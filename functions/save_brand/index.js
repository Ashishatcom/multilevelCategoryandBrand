const DBSetup = require('commons/db-setup');
const Response = require('commons/response');
const ValidateInput = require('commons/validate-input');
const Constants = require('commons/constants');
const sha512 = require('js-sha512');
const AppException = require('commons/app-exception');
const bcrypt = require('bcryptjs');
const AWS = require("aws-sdk");
const { Op } = require("sequelize");
        
const moment = require('moment');
const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//     SES: ses
// });

//db model
const Brands = DBSetup.Brand();



// handler
exports.handle = async (e, ctx) => {
	ctx.callbackWaitsForEmptyEventLoop = false;

	try {
		ValidateInput.validateAndThrow(e, {
            brandName: { required: true, type: 'string'},
            brandImage: { required: true, type: 'string'},
			brandDesc: {required: true, type: 'string'},
            catId:{type:'number'}
		})
			// const token = await ValidateInput.checkUser(e.token, validUserTypes, UserToken);
			const resp = await lambdaFunction(e);
			return Response.create(null, resp);
		
	} catch (e) {
		return Response.create(e);
	}
};

// main lambda function
async function lambdaFunction(data) {
	let saveUsers = await saveBrand(data);
	if(saveUsers){
	  return saveUsers
	} else{
		AppException.newException(Constants.ErrorCodes.GENERIC_FAILURE , Constants.Errors.GENERIC_FAILURE);
	}
}

async function saveBrand(data) {
	 let saveCategory =  await Brands.create({
        brandName:data.brandName,
         brandImage: data.brandImage,
         brandDesc: data.brandDesc,
         catId:data.catId
     });
      
     return saveCategory;
}

