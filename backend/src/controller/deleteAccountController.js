const mongoose = require("mongoose");
const Employee = require('../model/employee')
const Sponsored_Member = require('../model/sponsored_member')

const deleteAccount = async (req, res) => {
     // get the account to be deleted
     // Generate a unique suffix using timestamp
     const timestamp = Date.now();
     const uniqueSuffix = timestamp.toString(36);
     var account_selected
     if (mongoose.Types.ObjectId.isValid(req.params.account)) 
          account_selected = await Employee.findById(req.params.account)
     else
          account_selected = await Employee.findOne({ email: req.params.account })

     // active user; assuming sessions are already working
     const active_user = req.session.user

     // security checks
     if (!account_selected)
          return res.status(403).json({ message: "Employee not found." })


     if (!active_user)
          return res.status(403).json({ message: "Unauthorized access." })


     if (active_user._id.toString() === account_selected._id.toString())
          return res.status(403).json({ message: "Unauthorized access. You cannot delete your own account." });


     if (active_user.role != "head" && active_user.role != "Head")
          return res.status(403).json({ message: "Unauthorized access." })


     var SDWexists
     var SVexists

     // SDW should be cleared of all their cases
     if (account_selected.role === "sdw" || account_selected.role === "SDW") {
          SDWexists = await Sponsored_Member.exists({
               assigned_sdw: account_selected._id,
               is_active: true
          });

          if (SDWexists)
               return res.status(403).json({ message: "SDW has active case(s)." })
     } 

     // Supervisor must not have SDWs under them and active cases
     if (account_selected.role === "super" || account_selected.role === "supervisor") {
          SVexists = await Employee.exists({ manager: account_selected._id });
          SDWexists = await Sponsored_Member.exists({
               assigned_sdw: account_selected._id,
               is_active: true
          });

          if (SVexists)
               return res.status(403).json({ message: "Supervisor has SDW under them." })
          if (SDWexists)
               return res.status(403).json({ message: "Supervisor has active case(s)." })
     }

     // Head must not have supervisors/SDWs under them and active cases
     if (account_selected.role === "head" || account_selected.role === "Head") {
          SVexists = await Employee.exists({ manager: account_selected._id });
          SDWexists = await Sponsored_Member.exists({
               assigned_sdw: account_selected._id,
               is_active: true
          });

          if (SVexists)
               return res.status(403).json({ message: "Head has employees under them." })
          if (SDWexists)
               return res.status(403).json({ message: "Head has active case(s)." })
     }

     // Change Status
     account_selected.username = `${account_selected.username}_inactive_${uniqueSuffix}`;
     account_selected.is_active = false;
     await account_selected.save();

     try {
     const sessionCollection = mongoose.connection.collection('sessions');
     await sessionCollection.deleteMany({
     "session.user._id": account_selected._id.toString()
     });
     // console.log(`Sessions deleted for user ${account_selected._id}`);
     } catch (error) {
     console.error("Error deleting sessions:", error);
     }

     // Query all employees again for return; must be updated
     const active_employees = await Employee.find({ is_active: true });
     const inactive_employees = await Employee.find({ is_active: false });
     return res.status(200).json({ message: "Account deleted successfully", active_employees, inactive_employees });
}

module.exports = {
     deleteAccount
}
