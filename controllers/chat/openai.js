const { Configuration, OpenAIApi } = require("openai");

const { MyAddiv3 } = require("../../models/address/myAddiv3");

const getMyAddiv3s = async (coucode, estoreid) => {
  return await MyAddiv3(coucode, estoreid).find({}).exec();
};

exports.getGroceyResonse = async (req, res) => {
  const estoreid = req.headers.estoreid;
  const coucode = req.query.coucode;
  let addiv3Array = "";

  const addiv3s = await getMyAddiv3s(coucode, estoreid);

  addiv3s.forEach((addiv3) => {
    const { name, delfee, delfeetype, deltime, deltimetype } = addiv3;
    const delFee =
      delfeetype === "%"
        ? delfee + delfeetype + "of total amount"
        : delfeetype + delfee;
    addiv3Array =
      addiv3Array +
      name +
      " - " +
      delFee +
      " - delivers in " +
      deltime +
      " " +
      deltimetype +
      "\n";
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

            You will respond to questions regarding what location we are serving, the delivery fee, and the time to deliver. \n

            If we can't serve the location asked, just answer "Sorry, we can't deliver in that location right now"\n

            If ask about a product availability and price please reply "Please kindly find the product using the search box above to see its prices and availability"\n
            
            Answer in a very concise, gentle and nice manner.\n

            If question is something else please respond "Sorry, I can't answer your questions. Start ordering now by going to Home or Shop"\n\n

            Location, delivery fees and time:\n
            ${addiv3Array}\n

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
