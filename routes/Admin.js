const express = require("express");
const pool = require("../db");
const router = express.Router();
const bcrypt = require("bcryptjs");  // Import bcrypt

// login as admin
// register a new user
// admin can track progress of a particular user


router.post("/admin/login", async (req, res) => {
    console.log("Received login request");
    const {username,password} = req.body;

    try 
    {
      const result = await pool.query(
        `SELECT * FROM public."Admin" where username = $1`,
        [username]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: "Admin not found" });
      }

      const admin = result.rows[0];
      console.log("Check admin --->",admin);

      // Compare the entered password with the stored password in the database
      if (password !== admin.password) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // If credentials are correct, return success message
      res.status(200).json({
        message: "Login successful",
        admin: {
          id: admin.id,
          username: admin.username,
        },
      });


    }
    catch(err)
    {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }

});



router.post("/admin/register-client",async(req,res)=>{
    console.log("Recieved client registration request");

        const client_obj = ({
          name,
          email,
          username,
          password,
          height,
          fitness_goal,
          target_wt,
          starting_wt,
          joining_date,
        } = req.body);

       
      let recom_protein = calculate_recom_protein(starting_wt,fitness_goal) ;
      let recom_calories = calculate_recom_calories(starting_wt,fitness_goal);
      let recom_carbs = calculate_recom_carbs(starting_wt, fitness_goal);
      
      client_obj.recom_protein = recom_protein;
      client_obj.recom_calories = recom_calories;
      client_obj.recom_carbs = recom_carbs;

      console.log("Client object------->",client_obj);

        const salt = await bcrypt.genSalt(10); // Generate salt
        const hashedPassword = await bcrypt.hash(password, salt);  // Hash the password

        try 
        {
          // Validate if required fields are provided
          if (!name || !email || !username || !password) {
            return res.status(400).json({ error: "All fields are required" });
          }

          // Insert client data into the database, without specifying 'created_at'
          const result = await pool.query(
            `INSERT INTO public."Client_Table" (name, email, username, password, height, fitness_goal, target_wt, starting_wt, created_at, recommended_protein, recommended_calories, recommended_carbs)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [
              name,
              email,
              username,
              hashedPassword,
              height,
              fitness_goal,
              target_wt,
              starting_wt,
              joining_date,
              recom_protein, 
              recom_calories, 
              recom_carbs 
            ]
          );

          // Return success response
          res.status(201).json({
            message: "Client registered successfully",
            client: {
              id: result.rows[0].id,
              name: result.rows[0].name,
              email: result.rows[0].email,
              username: result.rows[0].username,
              height: result.rows[0].height,
              fitness_goal: result.rows[0].fitness_goal,
              target_wt: result.rows[0].target_wt,
              starting_wt: result.rows[0].starting_wt,
              joining_date: moment(result.rows[0].created_at).format("YYYY-MM-DD"),
              recommended_protein: result.rows[0].recommended_protein,
              recommended_calories: result.rows[0].recommended_calories,
              recommended_carbs: result.rows[0].recommended_carbs,
            },
          });
        }
        catch(err)
        {
            console.error(err);
            res.status(500).json({ error: "Server error while registering client" });
        }


})


function calculate_recom_protein (current_wt,fitness_goal)
{
  console.log("Current wt----->",current_wt);

  let protien_recom=null; 
  if(fitness_goal == "BULK" || fitness_goal == "CUT")
  {
    protien_recom = current_wt * 1.8;
    return protien_recom;
  }

}

function calculate_recom_calories(current_wt,fitness_goal)
{
  console.log("Current_wt======",current_wt);
  console.log("Fitness goal = = == ",fitness_goal);

  if (fitness_goal=="BULK")
  {
    let pounds = current_wt * 2.2;
    let maintainance_cals = pounds * 15;
    let choloric_suplus = maintainance_cals + (15/100 * maintainance_cals);
    return Math.round(choloric_suplus);

  }

  if(fitness_goal=="CUT")
  {
    let pounds = current_wt * 2.2;
    let maintainance_cals = pounds * 15;
    let choloric_deficiet = maintainance_cals - (15 / 100) * maintainance_cals;
    return Math.round(choloric_deficiet);
  }
}

function calculate_recom_carbs(current_wt,fitness_goal)
{ 
    if(fitness_goal=="BULK")
    {
        let recom_carbs = current_wt * 5;
        //console.log("Recommended carbs----->",recom_carbs);
        return recom_carbs;
    }

    if(fitness_goal == "CUT")
    {
      let recom_carbs = current_wt * 2;
      return recom_carbs;
      //console.log("Recommended carbs for cut= =",recom_carbs);
    }
}




module.exports = router;