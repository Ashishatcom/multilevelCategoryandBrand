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
const  Brands = DBSetup.Brand();
const CategoryJunctions = DBSetup.CategoryJunction();


Categorys.belongsToMany(Brands,{through: CategoryJunctions,foreignKey:'catId'});
// Categorys.belongsToMany(Brands,{through: CategoryJunctions,foreignKey:'brandId'});
Brands.belongsToMany(Categorys,{through: CategoryJunctions,foreignKey:'brandId'});
// Brands.belongsToMany(Categorys,{through: CategoryJunctions,foreignKey:'catId'});



// handler
exports.handle = async (e, ctx) => {
	ctx.callbackWaitsForEmptyEventLoop = false;

	try {
		ValidateInput.validateAndThrow(e, {
            // catName: {  type: 'string'},
            // catDesc: {  type: 'string'},
			// catImage: { type: 'string'},
			// parentId:{ type: 'number'},
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
	let saveUsers = await getCat(data);
	if(saveUsers){
	  return saveUsers
	} else{
		AppException.newException(Constants.ErrorCodes.GENERIC_FAILURE , Constants.Errors.GENERIC_FAILURE);
	}
}

async function getCat(data){
    let allCat = await Categorys.findAll({
        include: {
          model:   Brands
        }
    });
    //  return allCat
    if(allCat){
        let AllCategory = await AllCategorys(allCat);
     return AllCategory

    }
}

async function AllCategorys(allCat, parentId=false){
    // return allCat;

    let categorylist = [];
    let parentCat;
    if(parentId==false){
    // return {"messgae1":allCat};

        parentCat =  allCat.filter(element=> element.parentId == false)
        // return {"dhfhd":parentCat}
    }else{
        parentCat=  allCat.filter(element=>element.parentId == parentId)
    }
    //    return parentCat;
    for(let dataCat of parentCat){
        //   return dataCat
        categorylist.push({
            id:dataCat.id,
            name:dataCat.catName,
            Desc:dataCat.catDesc,
            Image:dataCat.catImage,
            Brands:dataCat.brands,
            children :await AllCategorys(allCat,dataCat.id)
        })
    }

    return categorylist;
}