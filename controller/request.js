const requestModel = require('../models/users');


// create request:
exports.CreateRequest = async (data) => {
    try {
        const check = await requestModel.findOne({ user: data.user });

        if (check) {
            console.log(`User already exists with request _id: ${check._id}`);
            return { result: 1, request_id: check._id };
        } else {
            let newUser = new requestModel({ user: data.user });
            await newUser.save(); 
            console.log(`Request generated with request _id: ${newUser._id}`);
            return { result: 1, request_id: newUser._id };
        }
    } catch (error) {
        console.error(error); 
        return { result: 0 };
    }
}


exports.UpdateRequest = async (data) => {
    try {
        const {request_id, ...updateData } = data;

        if ('user' in updateData) {
            return { result: 0, message: 'User name cannot be updated' };
        }

        const updatedRequest = await requestModel.findOneAndUpdate(
            { _id: request_id },
            { $set: updateData },
            { new: true } 
        );

        if (!updatedRequest) {
            return { result: 0, message: 'Request not found for update' };
        }

        console.log(`Request with request_id ${request_id} updated successfully`);
        return { result: 1, updatedRequest };
    } catch (error) {
        console.error(error);
        return { result: 0, message: 'Internal server error' };
    }
};












// exports.UpdateRequest = async (data) => {
//     try {
//         const { request_id, user, ...updateData } = data; 

//         if (user) {
//             return { result: 0, message: 'User data cannot be updated' };
//         }

//         const existingRequest = await requestModel.findOne({ _id: request_id });

//         if (!existingRequest) {
//             return { result: 0, message: 'Request not found for update' };
//         }

    
//         Object.assign(existingRequest, updateData);

        
//         const updatedRequest = await existingRequest.save();

//         console.log(`Request with request_id ${request_id} updated successfully`);
//         return { result: 1, updatedRequest };
//     } catch (error) {
//         console.error(error);
//         return { result: 0, message: 'Internal server error' };
//     }
// };
