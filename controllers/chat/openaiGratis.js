const ObjectId = require("mongoose").Types.ObjectId;
const { Configuration, OpenAIApi } = require("openai");

const Estore = require("../../models/authority/estore");
const Product = require("../../models/gratis/product");

const searchProduct = async (estoreid, message) => {
  const result = await Product.find({
    $text: { $search: message },
    estoreid: ObjectId(estoreid),
  }).exec();

  return result;
};

exports.getGroceyResponse = async (req, res) => {
  const estoreid = req.headers.estoreid;
  let promptLocation = "";
  let promptProduct = "";

  const estore = await Estore.findOne({ _id: ObjectId(estoreid) }).exec();

  const location = estore && estore.delloc ? estore.delloc.split(",") : [];
  const delfee = estore && estore.delfee ? estore.delfee : "0";
  const deltime = estore && estore.deltime ? estore.deltime : "0";

  location.forEach((loc) => {
    promptLocation =
      promptLocation +
      loc +
      " - " +
      delfee +
      " - delivers in " +
      deltime +
      "\n";
  });

  const products = await searchProduct(estoreid, req.body.message);

  products.forEach((prod) => {
    promptProduct = promptProduct + prod.title + " - " + prod.price + "\n";
  });

  const sentMessage = req.body.message;
  const openaiAPI = req.body.openaiAPI;

  try {
    const configuration = new Configuration({
      apiKey: openaiAPI,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `You're name is Grocey, an AI Assistant on this online grocery website.\n

            You will respond to questions regarding prices of products or items, what location we are serving, the delivery fee, and the time to deliver. \n

            Answer in a very concise, gentle and nice manner.\n

            If question is something else please respond "Sorry, I can't answer your questions. Start ordering now by going to Home or Shop"\n\n

            Location, delivery fees and time:\n
            ${promptLocation}\n

            Products and its prices:\n
            ${promptProduct}\n


            ${sentMessage}`,

      temperature: 0.3,
      max_tokens: 120,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    if (response.data.choices[0])
      res.json({ message: response.data.choices[0].text });
  } catch (error) {
    res.json({
      err:
        error.message +
        ". Openai API Key may expire or incorrect. Please contact administrator.",
    });
  }
};
