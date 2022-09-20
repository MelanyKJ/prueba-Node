import { PrismaClient } from "@prisma/client";
import  bcrypt  from "bcryptjs"
import  jwt  from "jsonwebtoken";

const prisma = new PrismaClient();

export const findAll = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({
      ok: true,
      data: users,
    });
  } catch (error) {
    res.json({
      ok: false,
      data: error.message,
    });
  }
};

export const create = async (req, res) => {
  try {
    const { body } = req;
    await bcrypt.hash(body.password, 10, async(err, hash) => {
      if(err){
        return res.status(500).send({
          msg: err
        });
      }else{
        const user = await prisma.user.create({
          data: {
            //...body,
            email: body.email,
            password:hash,
            name: body.name,
            phone_number:body.phone_number 
          },
        });
        res.json({
          ok: true,
          data: user,
        });
      }
      
    })
  } catch (error) {
    res.json({
      ok: false,
      data: error.message,
    });
  }
};

export const login = async (req, res) => {
  try{
    const { body } = req;
    const result = await prisma.user.findMany({
      where: {email:body.email}
    })
    if (!result.length) {
      return res.status(401).send({
        msg: 'Email or password is incorrect!'
      });
    }

    bcrypt.compare(body.password, result[0]['password'], async (bErr, bResult) => {
      if (bErr) {
        throw bErr;
      }
      if (bResult) {
        const token = await jwt.sign({ id: result[0].id }, 'the-super-strong-secrect', { expiresIn: '2h' });
        return res.status(200).send({
          msg: 'Logged in!',
          token,
          user: result[0]
        });
      }
      return res.status(401).send({
        msg: 'Username or password is incorrect!'
      });
    })

  }catch(error){
    res.json({
      ok: false,
      data: error.message,
    });
  }
}
//ESTA EN FACE DE PRUEBA
export const isVerify = async (req, res) => {
  if(!req.headers.authorization || !req.headers.authorization.startsWith('bearer') || !req.headers.authorization.split(' ')[1]){
    return res.status(422).json({
      message: "Please provide the token",
    })
  }

  const theToken = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(theToken,'the-super-strong-secrect')
  
  await prisma.user.findMany({
    where:{id:decoded.id}
  }, function(error,result,fields){
    if(error) throw error;
    return res.send({
      error:false,
      data:result[0],
      message: 'Fetch Successfully.'
    })
  })
}