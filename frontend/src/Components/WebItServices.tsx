import { Box, Typography, Stack, Grid, Card, CardContent } from "@mui/material";

const WebItServices = () => {
  return (
    <Box>
      {/* Gradient Heading */}
      <Box
        sx={{
          fontSize: "130px",
          fontFamily: "Bold_W",
          paddingTop: "40px",
          textTransform: "uppercase",
          background: "linear-gradient(-1deg, #fff, var(--webprimary))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          opacity: 0.8,
          "@media (max-width: 991px)": { fontSize: "100px" },
          "@media (max-width: 768px)": { fontSize: "80px" },
          "@media (max-width: 650px)": { fontSize: "60px" },
          "@media (max-width: 500px)": { fontSize: "50px" },
          "@media (max-width: 450px)": { fontSize: "40px" },
        }}
      >
        IT Services
      </Box>

      {/* Introduction */}
      <Typography
        sx={{
          fontSize: "16px",
          fontFamily: "Regular_W",
          color: "#444",
          maxWidth: "800px",
          mb: 4,
        }}
      >
        We provide professional IT services that empower businesses and students
        to build, grow, and compete in the digital world. From interactive
        websites to mobile apps and performance-focused marketing campaigns — we
        deliver tailored solutions to meet your specific goals.
      </Typography>

      <Stack spacing={4}>
        {/* Web Development */}
        <Box>
          <Typography
            sx={{ fontSize: "20px", fontFamily: "SemiBold_W", mb: 1 }}
          >
            1. Web Development
          </Typography>
          <Typography
            sx={{ fontSize: "15px", fontFamily: "Regular_W", color: "#555" }}
          >
            We build modern, responsive, and SEO-friendly websites using the
            latest technologies and best design practices. Our solutions range
            from simple static landing pages to dynamic portals and fully
            functional web applications. We prioritize clean design, optimal
            performance, and strong user experiences. Whether you're a startup,
            a student, or an established business, we tailor web development to
            your goals. Each site we build is tested for cross-browser
            compatibility and mobile responsiveness. We also integrate CMS
            platforms or custom admin panels when needed. Security, speed, and
            scalability remain central to every project we deliver.
          </Typography>
        </Box>

        {/* Mobile App Development */}
        <Box>
          <Typography
            sx={{ fontSize: "20px", fontFamily: "SemiBold_W", mb: 1 }}
          >
            2. Mobile App Development
          </Typography>
          <Typography
            sx={{ fontSize: "15px", fontFamily: "Regular_W", color: "#555" }}
          >
            We develop intuitive and robust mobile applications for Android and
            iOS platforms using both native and cross-platform tools. Whether
            you need an app for education, business, or productivity, we focus
            on user experience, speed, and seamless functionality. From
            wireframing to deployment on the Play Store or App Store, our
            process is collaborative and transparent. We help transform your
            ideas into apps that deliver real value and engagement. Our mobile
            apps include features like push notifications, offline access,
            integrations with APIs, and scalable backend support. We also
            provide post-launch support and updates to keep your app current.
          </Typography>
        </Box>

        {/* Digital Marketing */}
        <Box>
          <Typography
            sx={{ fontSize: "20px", fontFamily: "SemiBold_W", mb: 1 }}
          >
            3. Digital Marketing
          </Typography>
          <Typography
            sx={{ fontSize: "15px", fontFamily: "Regular_W", color: "#555" }}
          >
            Our digital marketing services help businesses and individuals grow
            their presence and reach online. We craft result-driven strategies
            in SEO, Google Ads, social media campaigns, email marketing, and
            content creation. Every campaign is tailored to your brand's voice
            and targeted toward your specific audience. Our goal is to drive
            traffic, boost engagement, and convert leads into customers. Using
            tools like analytics and A/B testing, we continuously refine
            performance. Whether you're launching a new product or increasing
            brand visibility, we ensure consistent and measurable growth.
            Transparency and ROI are the backbone of every campaign we run.
          </Typography>
        </Box>
      </Stack>

      {/* Why Choose Us - Advantages Section */}
      <Box sx={{ mt: 6 }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            fontFamily: "SemiBold_W",
            fontSize: "24px",
            mb: 3,
            "@media (max-width: 768px)": {
              fontSize: "22px",
              "@media (max-width: 690px)": { fontSize: "20px" },
            },
          }}
        >
          Why Choose Us
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
            mb: 4,
          }}
        >
          {/* Advantage 1: On-Time Delivery */}
          <Card
            sx={{
              p: 3,
              height: "100%",
              boxShadow: 3,
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                ⏰
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "SemiBold_W",
                  fontSize: "18px",
                }}
              >
                On-Time Delivery
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Regular_W",
                fontSize: "14px",
                opacity: 0.9,
                lineHeight: 1.6,
              }}
            >
              We respect deadlines and deliver projects on schedule without
              compromising quality.
            </Typography>
          </Card>

          {/* Advantage 2: Expert Team */}
          <Card
            sx={{
              p: 3,
              height: "100%",
              boxShadow: 3,
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >

              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "SemiBold_W",
                  fontSize: "18px",
                }}
              >
                Expert Team
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Regular_W",
                fontSize: "14px",
                opacity: 0.9,
                lineHeight: 1.6,
              }}
            >
              Our skilled professionals bring years of experience and
              cutting-edge expertise.
            </Typography>
          </Card>

          {/* Advantage 3: 24/7 Support */}
          <Card
            sx={{
              p: 3,
              height: "100%",
              boxShadow: 3,
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              color: "white",
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                🛠️
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "SemiBold_W",
                  fontSize: "18px",
                }}
              >
                24/7 Support
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Regular_W",
                fontSize: "14px",
                opacity: 0.9,
                lineHeight: 1.6,
              }}
            >
              Round-the-clock technical support to ensure your business runs
              smoothly.
            </Typography>
          </Card>

          {/* Advantage 4: Cost-Effective Solutions */}
          <Card
            sx={{
              p: 3,
              height: "100%",
              boxShadow: 3,
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              color: "white",
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                💰
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "SemiBold_W",
                  fontSize: "18px",
                }}
              >
                Cost-Effective
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Regular_W",
                fontSize: "14px",
                opacity: 0.9,
                lineHeight: 1.6,
              }}
            >
              Premium quality services at competitive prices that fit your
              budget.
            </Typography>
          </Card>

          {/* Advantage 5: Latest Technology */}
          <Card
            sx={{
              p: 3,
              height: "100%",
              boxShadow: 3,
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
              background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
              color: "#333",
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  backgroundColor: "rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                🚀
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "SemiBold_W",
                  fontSize: "18px",
                }}
              >
                Latest Technology
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Regular_W",
                fontSize: "14px",
                opacity: 0.8,
                lineHeight: 1.6,
              }}
            >
              We use cutting-edge tools and frameworks to build future-ready
              solutions.
            </Typography>
          </Card>

          {/* Advantage 6: Scalable Solutions */}
          <Card
            sx={{
              p: 3,
              height: "100%",
              boxShadow: 3,
              borderRadius: "12px",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
              background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
              color: "#333",
            }}
          >
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  backgroundColor: "rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                📈
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "SemiBold_W",
                  fontSize: "18px",
                }}
              >
                Scalable Solutions
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Regular_W",
                fontSize: "14px",
                opacity: 0.8,
                lineHeight: 1.6,
              }}
            >
              Our solutions grow with your business, adapting to your evolving
              needs.
            </Typography>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default WebItServices;
