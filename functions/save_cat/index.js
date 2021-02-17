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
const Categorys = DBSetup.Category();
const CategoryJunctions = DBSetup.CategoryJunction();



// handler
exports.handle = async (e, ctx) => {
	ctx.callbackWaitsForEmptyEventLoop = false;

	try {
		ValidateInput.validateAndThrow(e, {
            catName: { required: true, type: 'string'},
            catDesc: { required: true, type: 'string'},
			catImage: {required: true, type: 'string'},
			parentId:{ type: 'number'},
			brandId:{type:'number'}
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
	let saveUsers = await saveCat(data);
	if(saveUsers){
	  return saveUsers
	} else{
		AppException.newException(Constants.ErrorCodes.GENERIC_FAILURE , Constants.Errors.GENERIC_FAILURE);
	}
}

async function saveCat(data) {
	 let saveCategory =  await Categorys.create({
         catName:data.catName,
         catDesc: data.catDesc,
         catImage: data.catImage,
         parentId:data.parentId,
		//  brandId:data.brandId
     });
      if(saveCategory){
		  if(data.brandId && saveCategory.id){
			let JunctionCreate = await CategoryJunctions.create({
				catId: saveCategory.id,
				brandId:data.brandId
			  });
			return  JunctionCreate
		  }
		  return saveCategory;
		  
	  }
}

