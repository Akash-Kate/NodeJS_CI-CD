const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require('../db');
const moment = require('moment');
// login in as a user
// track progress
// add food display macros


router.post("/client/login",async (req,res)=>{

    const {username, password} = req.body;

    //validate if required feildds are provided
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }


    try
    {
        // chk is client exists in the database
        const result = await pool.query(
            `SELECT * FROM public."Client_Table" WHERE username = $1`,[username]
        );

        if (result.rows.length === 0)
        {
            return res.status(400).json({ error: "Client not found"});
        }

        const client = result.rows[0];

        //compare the entered password with the stored hashed password

        const isMatch =  await bcrypt.compare(password,client.password);
        
        if(!isMatch)
        {
          return res.status(400).json({error:"Invalid credentials"});  
        }

        // If credentials match return success
        res.status(200).json({
            message:"Login Successfull",
            client: {
                id: client.id,
                name: client.name,
                email:client.email,
                username:client.username,
                height:client.height,
                fitness_goal: client.fitness_goal,
                target_wt:client.target_wt,
                starting_wt:client.starting_wt

            }
        })
    }
    catch(err)
    {
        console.log(err);
        res.send(500).json({error:"Server error"});
    }

    //res.send({data:""})
})


router.post("/client/progress",async(req,res)=>{

    const { client_id, weight, date } = req.body;

    if(!client_id || !weight || !date)
    {
        return res.status(400).json({ error: "Client ID, weight and date are required"});
    }

    try
    {
        const result = await pool.query(
          `INSERT INTO Public."Progress" (client_id, current_wt, recorded_at) VALUES ($1, $2, $3) RETURNING *`,
          [client_id,weight,date]
        );

        const progress_report = {
          client_id: result.rows[0].client_id,
          current_wt: result.rows[0].current_wt,
          //recorded_at: moment(result.rows[0].recorded_at).format("YYYY-MM-DD")
          recorded_at: result.rows[0].recorded_at
        };

        res.status(201).json({
          message: "Progress recorded successfully",
          progress: progress_report,
        });
    }
    catch(err)
    {

        if (err.constraint)
        {
            res.status(500).json({ error: "Same Date Error" });
        }

        else
        {
            console.error("Error inserting progress:", err);
            res.status(500).json({ error: "Server error" });
        }
    }
})


router.post("/client/track-progres",async(req,res)=>{

    const { client_id } = req.body;
    console.log("Hii this is progress seeker")
    console.log("Client id =  =",client_id)

    try
    {
      const result = await pool.query(
        `SELECT recorded_at, current_wt FROM Public."Progress" WHERE client_id = $1 ORDER BY recorded_at`,
        [client_id]
      );
      console.log("Length of result----->",result.rows.length);

      console.log("Lets see this Result Array = = = ",result.rows);

      progress_array = [];
      console.log("Array ========", progress_array);

      let result_arr =result.rows;

      for(let i=0;i< result_arr.length; i++)
      {
          //console.log("Date in for loop------>", result_arr[i].recorded_at);
          let obj = 
          {
            "recorded_at": moment(result_arr[i].recorded_at).format("YYYY-MM-DD"),
            "current_wt": result_arr[i].current_wt
          }
          //console.log("Object date=====",obj.recorded_at)
          progress_array[i] =  obj;
          //obj = null;
      }

      console.log("Our Array--------->",progress_array)

      res.status(201).json({
        message: "Here's you progress uptil now",
        client_id: client_id,
        progress_array: progress_array
      });


    }
    catch(err)
    {
        if (err.constraint) {
          res.status(500).json({ error: "Same Date Error" });

        } 
        else {
          console.error("Error inserting progress:", err);
          res.status(500).json({ error: "Server error" });
        }
    }   

})


router.post("/client/save-macros",async(req,res)=>{

    console.log("HITTTTT SAVE MACROS")

    const { client_id, macro_entry_date, food_item, quantity_units } = req.body;

    const foodNutrition = {
      chicken: { protein: 27, calories: 165, carbs: 0 },
      rice: { protein: 2.7, calories: 130, carbs: 28 },
      sweet_potato: { protein: 1.6, calories: 86, carbs: 20.1 },
      fruits: { protein: 0.9, calories: 52, carbs: 14 },
      dry_fruits: { protein: 12, calories: 600, carbs: 40 },
      whole_egg: { protein: 6.3, calories: 70, carbs: 0.4 },
      egg_white: { protein: 3.6, calories: 17, carbs: 0.2 },
    };

    try
    {
      console.log("Food Item_-------------------->",food_item);
      const food = foodNutrition[food_item.toLowerCase()];
      if (!food) {
        return res.status(400).json({ error: "Invalid food item" });   
      }

      let protein_gm = null;
      let calories_kcal = null;
      let carbs_gm = null;

      if(food_item == "whole_egg")
      {
        console.log("Inside whole eggs");
        console.log("Chk item--->", food);
        console.log("chk quantity--->", quantity_units);
          protein_gm = Math.round(quantity_units * food.protein); 
          calories_kcal = Math.round(quantity_units * food.calories);
          carbs_gm = Math.round(quantity_units * food.carbs); 
      }
      else if (food_item == "egg_white") {
        console.log("Inside egg white");
        console.log("Chk item--->", food);
        console.log("chk quantity--->", quantity_units);
        protein_gm = Math.round(quantity_units * food.protein);
        calories_kcal = Math.round(quantity_units * food.calories);
        carbs_gm = Math.round(quantity_units * food.carbs);
      } else {
        console.log("Inside else");
        console.log("Chk item--->", food);
        console.log("chk quantity--->", quantity_units);
        protein_gm = Math.round((quantity_units / 100) * food.protein);
        calories_kcal = Math.round((quantity_units / 100) * food.calories);
        carbs_gm = Math.round((quantity_units / 100) * food.carbs);
      }


      const result = await pool.query(
        `INSERT INTO public."Macros"(client_id, macro_entry_date, food_item, quantity, protein, calories, carbs)
          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [client_id,macro_entry_date,food_item,quantity_units,protein_gm,calories_kcal,carbs_gm]

      );

        let macros = {
          client_id: result.rows[0].client_id,
          macro_entry_date: moment(result.rows[0].macro_entry_date).format("YYYY-MM-DD"),
          food_item: result.rows[0].food_item,
          quantity: result.rows[0].quantity,
          protein: result.rows[0].protein,
          calories: result.rows[0].calories,
          carbs: result.rows[0].carbs
        };

        res.status(200).json({
          msg: "Here is your macro entry",
          macros: macros
        })
    }
    catch(err)
    {
      console.log("error",err);
        res.status(400).json({error: "Server Error",err:err});
    }


})



router.post('/client/date-intake',async (req,res)=>{

  const {client_id,date} = req.body;
  console.log("date------->",date);
  console.log("client_id--------->",client_id);

  console.log("Inside date intake");

  try
  {

    const result = await pool.query(
      `SELECT client_id, food_item, quantity, protein, calories, carbs FROM public."Macros" WHERE macro_entry_date = $1 AND client_id= $2 `,
      [date, client_id]
    );

    console.log("Result ---->",result.rows);

    res.status(200).json({intake:result.rows});

  }
  catch(err)
  {
    console.log("In catch",err);
    res.status(400).json({err:err});
  }

})

router.post('/client/today-macro-total',async (req,res)=>{


  const { client_id, date } = req.body;

  try
  {
      const result = await pool.query(
        
        `SELECT 
              SUM(m.protein) AS total_protein,
              SUM(m.calories) AS total_cals,
              SUM(m.carbs) AS total_carbs,
              c.recommended_protein,
              c.recommended_calories,
              c.recommended_carbs
        FROM 
              public."Macros" m
        JOIN 
              public."Client_Table" c
        ON 
              m.client_id = c.client_id
        WHERE 
              m.macro_entry_date = $1 
              AND m.client_id = $2
        GROUP BY 
              c.recommended_protein, c.recommended_calories, c.recommended_carbs;`,
              [date,client_id]
      );


      console.log("Result--------->",result.rows[0]);
      res.status(200).json({
        msg: "Your today's total macro count",
        result: result.rows
      })

  }
  catch(err)
  {
      res.status(200).json({
        msg:"Server Error",
        err: err
      })
  }



})

module.exports = router;