import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import { useLocation, useNavigate } from "react-router-dom";

const benefits = [
  {
    number: "01",
    title: "IT Services",
    desc: "We deliver high-quality web and software development services tailored to meet business needs and drive digital transformation.",
  },
  {
    number: "02",
    title: "Inplant Training",
    desc: "Gain hands-on exposure in real-time industrial environments to bridge the gap between academic learning and industry demands.",
  },
  {
    number: "03",
    title: "Internship Programmes",
    desc: "Work on live projects under the guidance of professionals to enhance your practical skills and industry knowledge.",
  },
  {
    number: "04",
    title: "Final Year Projects",
    desc: "Get complete assistance on innovative final year projects, from concept development to implementation and documentation.",
  },
  {
    number: "05",
    title: "Workshop Sessions",
    desc: "Participate in expert-led workshops that focus on current technologies, tools, and practical application through guided sessions.",
  },
  {
    number: "06",
    title: "Courses",
    desc: "Learn essential, industry-relevant skills through expert-led, hands-on training designed to prepare you for real-world challenges.",
  },
  
];

const WebServices = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleDetail = (data: any) => {
    console.log(data);
    if (data === "Courses") {
      navigate("/services/courses");
    } else if (data === "IT Services") {
      navigate("/itservices");
    } else if (
      data === "Internship Programmes" ||
      data === "Workshop Sessions"
    ) {
      navigate("/services/category", { state: data });
    } else {
      navigate("/services/details", { state: data });
    }
  };

  return (
    <Box
      className="webServices"
      sx={{
        padding: "60px 0px",
        "@media (max-width: 768px)": { padding: "40px 0px" },
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          "@media (max-width: 690px)": {
            flexDirection: "column",
            alignItems: "start",
            gap: 2,
          },
        }}
      >
        <Box
          width={"80%"}
          sx={{ "@media (max-width: 690px)": { width: "100%" } }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontFamily: "SemiBold_W",
              fontSize: "24px",
              "@media (max-width: 768px)": { fontSize: "22px" },
              "@media (max-width: 690px)": { fontSize: "20px" },
            }}
          >
            Services
          </Typography>
          <Typography
            sx={{
              fontFamily: "Regular_W",
              fontSize: "14px",
              "@media (max-width: 768px)": { fontSize: "14px" },
            }}
          >
            Transform Knowledge into Power. Gain industry-ready skills with our
            advanced IT courses, inplant training, and project-based learning
            programs.
          </Typography>
        </Box>
        <Box
          width={"20%"}
          sx={{
            textAlign: "right",
            "@media (max-width: 690px)": { width: "100%", textAlign: "left" },
          }}
        >
          {location.pathname === "/services" ? (
            ""
          ) : (
            <Box
              component="button"
              sx={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                px: 2,
                py: 1,
                borderRadius: "6px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Medium_W",
              }}
              onClick={() => navigate("/services")}
            >
              View All
            </Box>
          )}
        </Box>
      </Box>

      <Grid
        container
        spacing={3}
        sx={{ justifyContent: "space-between", alignContent: "center" }}
      >
        {benefits.map((item, index) => (
          <Box
            flexBasis={"30%"}
            key={index}
            sx={{
              "@media (max-width: 991px)": { flexBasis: "48%" },
              "@media (max-width: 690px)": { flexBasis: "100%" },
            }}
          >
            <Card
              elevation={0}
              sx={{
                borderRadius: "10px",
                border: "1px solid #e0e0e0",
                height: "100%",
              }}
            >
              <CardContent>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  sx={{
                    fontFamily: "SemiBold_W",
                    fontSize: "24px",
                    textAlign: "right",
                    "@media (max-width: 768px)": { fontSize: "20px" },
                  }}
                >
                  {item.number}
                </Typography>
                <Typography
                  variant="subtitle1"
                  mt={1}
                  sx={{
                    fontFamily: "Bold_W",
                    fontSize: "24px",
                    lineHeight: "1.4",
                    "@media (max-width: 768px)": { fontSize: "20px" },
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  mt={1}
                  sx={{
                    fontFamily: "Regular_W",
                    "@media (max-width: 768px)": { fontSize: "14px" },
                  }}
                >
                  {item.desc}
                </Typography>

                <Box mt={2}>
                  <IconButton
                    sx={{
                      border: "1px solid #eee",
                      width: 36,
                      height: 36,
                    }}
                    onClick={() => {
                      handleDetail(item.title);
                    }}
                  >
                    <NorthEastIcon
                      fontSize="small"
                      sx={{ color: "var(--webprimary)" }}
                    />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Grid>
    </Box>
  );
};

export default WebServices;
