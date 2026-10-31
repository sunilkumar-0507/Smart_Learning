import type { SubjectSeed } from './types';

export const computerNetworks: SubjectSeed = {
  id: 'cn',
  name: 'Computer Networks',
  description: 'How data travels — network models, addressing, routing, transport protocols, DNS, HTTP and security.',
  color: '#0284c7',
  topics: [
    {
      id: 'cn-fundamentals',
      name: 'Network Fundamentals',
      description: 'Network types, topologies, devices and key performance measures.',
      difficulty: 1,
      importance: 85,
      minutes: 45,
      prerequisites: [],
      explanation:
        'A computer network connects devices so they can share data and resources. Networks are classified by scale — PAN, LAN, MAN and WAN — and by topology, such as star, bus, ring or mesh. Common devices include switches (connect devices within a LAN), routers (connect different networks) and access points (provide wireless access). Performance is described by bandwidth (maximum data rate), throughput (achieved rate) and latency (delay).',
      notes: [
        'LAN: building/campus; WAN: spans cities or countries (the Internet).',
        'Star topology: all devices connect to a central switch.',
        'Switch → within a network; router → between networks.',
        'Bandwidth = capacity; throughput = actual rate; latency = delay.',
        'Protocols are agreed rules for communication.',
      ],
      code: {
        language: 'bash',
        snippet:
          '# Measure latency (round-trip time) to a host\nping -c 4 example.com\n\n# Show this computer\'s network interfaces and addresses\nip addr        # Linux\nipconfig       # Windows\n\n# Trace the routers between you and a destination\ntraceroute example.com   # Linux/macOS\ntracert example.com      # Windows',
      },
      exercise:
        'Sketch the network in your home or lab: identify each device (router, switch, access point, end devices), the topology used and whether links are wired or wireless. Run ping to two different hosts and compare their latency.',
      questions: [
        ['Which network type typically covers a single building or campus?', ['WAN', 'MAN', 'LAN', 'PAN'], 2, 'A Local Area Network spans a limited area such as an office or campus.'],
        ['Which device forwards packets between different networks?', ['Router', 'Switch', 'Hub', 'Repeater'], 0, 'Routers connect networks and choose paths using IP addresses.'],
        ['In a star topology, devices are connected…', ['in a closed loop', 'to a single shared cable', 'directly to every other device', 'to a central device such as a switch'], 3, 'All nodes connect to a central hub or switch.'],
        ['What does latency measure?', ['The maximum data rate of a link', 'The delay for data to travel from source to destination', 'The number of connected devices', 'The size of a packet'], 1, 'Latency is delay, commonly measured as round-trip time with ping.'],
        ['What is a network protocol?', ['A set of rules governing communication between devices', 'A type of cable', 'A network password', 'A hardware vendor'], 0, 'Protocols such as TCP, IP and HTTP define message formats and behaviour.'],
      ],
    },
    {
      id: 'cn-osi',
      name: 'OSI Model',
      description: 'The seven layers, their responsibilities and encapsulation.',
      difficulty: 2,
      importance: 90,
      minutes: 60,
      prerequisites: ['cn-fundamentals'],
      explanation:
        'The OSI reference model divides network communication into seven layers: Physical, Data Link, Network, Transport, Session, Presentation and Application. Each layer provides services to the one above and relies on the one below. As data moves down the stack, each layer adds its own header — a process called encapsulation — producing bits at the physical layer, frames at the data link layer, packets at the network layer and segments at the transport layer.',
      notes: [
        'Layers 1–7: Physical, Data Link, Network, Transport, Session, Presentation, Application.',
        'Mnemonic (bottom-up): "Please Do Not Throw Sausage Pizza Away".',
        'PDUs: bits (L1), frames (L2), packets (L3), segments (L4).',
        'Switches work at L2 (MAC); routers at L3 (IP).',
        'Encapsulation adds headers going down; decapsulation removes them going up.',
      ],
      code: {
        language: 'text',
        snippet:
          'Layer 7  Application    HTTP, DNS, SMTP          data\nLayer 6  Presentation   TLS encryption, encoding data\nLayer 5  Session        session management       data\nLayer 4  Transport      TCP, UDP (ports)         segment / datagram\nLayer 3  Network        IP, ICMP (routing)       packet\nLayer 2  Data Link      Ethernet, Wi-Fi (MAC)    frame\nLayer 1  Physical       cables, radio, signals   bits\n\nSending:   [HTTP data] -> [TCP|data] -> [IP|TCP|data] -> [Eth|IP|TCP|data|FCS] -> bits',
      },
      exercise:
        'For loading a web page, describe what happens at each OSI layer on the sending computer. Then classify ten technologies (Ethernet, IP, TCP, HTTP, TLS, Wi-Fi, UDP, DNS, fibre optic cable, MAC address) by OSI layer.',
      questions: [
        ['How many layers does the OSI model have?', ['4', '5', '7', '9'], 2, 'The OSI reference model has seven layers.'],
        ['At which layer does IP routing operate?', ['Data Link', 'Network', 'Transport', 'Session'], 1, 'Layer 3 (Network) handles logical addressing and routing.'],
        ['What is the PDU at the Data Link layer called?', ['Frame', 'Packet', 'Segment', 'Bit'], 0, 'Layer 2 encapsulates packets into frames with MAC addresses.'],
        ['Which layer is responsible for end-to-end delivery using port numbers?', ['Network', 'Physical', 'Presentation', 'Transport'], 3, 'TCP and UDP operate at layer 4 and use ports to identify applications.'],
        ['What is encapsulation?', ['Encrypting all data', 'Each layer adding its own header to data from the layer above', 'Compressing packets', 'Removing errors from frames'], 1, 'Headers (and sometimes trailers) are added layer by layer when sending.'],
      ],
    },
    {
      id: 'cn-tcpip',
      name: 'TCP/IP Model',
      description: 'The four-layer Internet model and how it maps to OSI.',
      difficulty: 2,
      importance: 85,
      minutes: 45,
      prerequisites: ['cn-osi'],
      explanation:
        'The TCP/IP model is the practical architecture of the Internet. It has four layers: Link (network access), Internet, Transport and Application. The Application layer merges OSI’s application, presentation and session layers; the Internet layer corresponds to the OSI network layer and is built around IP; the Transport layer provides TCP and UDP; and the Link layer combines the OSI data link and physical layers.',
      notes: [
        'Four layers: Link, Internet, Transport, Application.',
        'Application = OSI layers 5–7.',
        'Internet layer = OSI layer 3 (IP, ICMP).',
        'Link layer = OSI layers 1–2 (Ethernet, Wi-Fi).',
        'OSI is a reference model; TCP/IP is what the Internet actually runs.',
      ],
      code: {
        language: 'text',
        snippet:
          'TCP/IP layer      OSI equivalent             Examples\n-----------------------------------------------------------------\nApplication       Application/Presentation/  HTTP, DNS, SMTP, SSH\n                  Session (7-5)\nTransport         Transport (4)              TCP, UDP\nInternet          Network (3)                IPv4, IPv6, ICMP\nLink              Data Link + Physical (2-1) Ethernet, Wi-Fi, ARP',
      },
      exercise:
        'Draw the OSI and TCP/IP models side by side and connect corresponding layers. For an email sent with SMTP, list the protocol used at each TCP/IP layer from the sender’s application down to the Wi-Fi link.',
      questions: [
        ['How many layers does the TCP/IP model have?', ['4', '7', '3', '5'], 0, 'Link, Internet, Transport and Application.'],
        ['Which TCP/IP layer corresponds to the OSI network layer?', ['Link', 'Transport', 'Application', 'Internet'], 3, 'The Internet layer handles IP addressing and routing.'],
        ['Which OSI layers are combined into the TCP/IP Application layer?', ['Physical and Data Link', 'Session, Presentation and Application', 'Network and Transport', 'Transport and Session'], 1, 'TCP/IP folds the top three OSI layers into one.'],
        ['Which protocol belongs to the TCP/IP Internet layer?', ['HTTP', 'TCP', 'IP', 'Ethernet'], 2, 'IP is the central protocol of the Internet layer.'],
        ['What is the key difference between OSI and TCP/IP?', ['TCP/IP is a practical protocol suite; OSI is mainly a conceptual reference model', 'OSI is used on the Internet; TCP/IP is not', 'They have the same number of layers', 'TCP/IP has no transport layer'], 0, 'The Internet is built on TCP/IP; OSI is used for teaching and describing networks.'],
      ],
    },
    {
      id: 'cn-ethernet',
      name: 'Ethernet & Switching',
      description: 'MAC addresses, Ethernet frames, switching tables and ARP.',
      difficulty: 3,
      importance: 70,
      minutes: 60,
      prerequisites: ['cn-osi'],
      explanation:
        'Ethernet is the dominant wired LAN technology. Every network interface has a 48-bit MAC address used for delivery within a local network. A switch learns which MAC addresses are reachable through each port by inspecting source addresses, then forwards frames only to the correct port; unknown destinations are flooded. To send an IP packet within the LAN, a host uses ARP (Address Resolution Protocol) to discover the MAC address that corresponds to an IP address.',
      notes: [
        'MAC address: 48 bits, written as six hex pairs (e.g. 3c:22:fb:12:9a:01).',
        'Switches learn source MACs and build a MAC address table.',
        'Unknown destination or broadcast → frame is flooded.',
        'ARP maps IP addresses to MAC addresses on the local network.',
        'Ethernet frames end with an FCS (CRC) for error detection.',
      ],
      code: {
        language: 'bash',
        snippet:
          '# Show the ARP cache: IP address -> MAC address mappings\narp -a\n\n# Example output\n# 192.168.1.1   a4:2b:b0:11:22:33   gateway\n# 192.168.1.20  3c:22:fb:12:9a:01   laptop\n\n# Switch MAC table (conceptual)\n# Port 1 -> a4:2b:b0:11:22:33\n# Port 4 -> 3c:22:fb:12:9a:01',
      },
      exercise:
        'Simulate a four-port switch on paper: starting with an empty MAC table, process a sequence of six frames (source, destination, input port) and record whether each is flooded or forwarded and how the table changes.',
      questions: [
        ['How long is a MAC address?', ['32 bits', '48 bits', '64 bits', '128 bits'], 1, 'MAC addresses are 48 bits, usually written as 12 hexadecimal digits.'],
        ['How does a switch learn which port leads to a device?', ['By reading the source MAC address of incoming frames', 'By asking the router', 'By reading the IP address of packets', 'It is configured manually for every device'], 0, 'Switches record the source MAC and incoming port of each frame.'],
        ['What does a switch do with a frame whose destination MAC is not in its table?', ['Drops it', 'Sends it back to the sender', 'Encrypts it', 'Floods it out of all ports except the incoming one'], 3, 'Flooding ensures delivery; the reply then teaches the switch the correct port.'],
        ['What is the purpose of ARP?', ['To assign IP addresses', 'To translate domain names into IP addresses', 'To find the MAC address for a known IP address on the local network', 'To encrypt frames'], 2, 'ARP broadcasts "who has this IP?" and the owner replies with its MAC address.'],
        ['What is the purpose of the FCS field in an Ethernet frame?', ['Error detection', 'Encryption', 'Routing', 'Compression'], 0, 'The Frame Check Sequence is a CRC that lets the receiver detect corrupted frames.'],
      ],
    },
    {
      id: 'cn-ip',
      name: 'IP Addressing & Subnetting',
      description: 'IPv4 structure, CIDR notation, subnet masks, private ranges and IPv6.',
      difficulty: 4,
      importance: 95,
      minutes: 120,
      prerequisites: ['cn-tcpip'],
      explanation:
        'An IPv4 address is 32 bits, written as four decimal octets such as 192.168.10.25. CIDR notation (/24) states how many leading bits form the network portion; the remaining bits identify hosts. A /24 network has 2⁸ = 256 addresses, of which 254 are usable because the first is the network address and the last is the broadcast address. Subnetting borrows host bits to create smaller networks. Private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) are not routed on the public Internet and rely on NAT. IPv6 uses 128-bit addresses to solve IPv4 exhaustion.',
      notes: [
        'IPv4 = 32 bits; IPv6 = 128 bits.',
        '/n → network bits; hosts = 2^(32−n) − 2 usable.',
        '/24 mask = 255.255.255.0; /26 = 255.255.255.192.',
        'Network address = all host bits 0; broadcast = all host bits 1.',
        'Private: 10/8, 172.16/12, 192.168/16.',
      ],
      code: {
        language: 'text',
        snippet:
          'Address: 192.168.10.77/26\nMask:    255.255.255.192   (26 network bits, 6 host bits)\n\nBlock size = 256 - 192 = 64  -> subnets start at .0 .64 .128 .192\n77 falls in the .64 block:\n  Network   192.168.10.64\n  First     192.168.10.65\n  Last      192.168.10.126\n  Broadcast 192.168.10.127\n  Usable hosts = 2^6 - 2 = 62',
      },
      exercise:
        'Divide 192.168.50.0/24 into four equal subnets. For each subnet, give the network address, first and last usable host, broadcast address and subnet mask. Then determine which subnet contains 192.168.50.200.',
      questions: [
        ['How many bits are in an IPv4 address?', ['16', '64', '32', '128'], 2, 'IPv4 addresses are 32 bits long.'],
        ['How many usable host addresses are in a /24 network?', ['254', '256', '255', '128'], 0, '2⁸ = 256 addresses minus the network and broadcast addresses.'],
        ['What is the subnet mask for /26?', ['255.255.255.0', '255.255.255.128', '255.255.255.224', '255.255.255.192'], 3, '26 network bits leave the last octet as 11000000 = 192.'],
        ['Which of these is a private IPv4 address?', ['8.8.8.8', '192.168.1.15', '142.250.0.1', '1.1.1.1'], 1, '192.168.0.0/16 is reserved for private networks.'],
        ['What is the broadcast address of 10.0.0.0/30?', ['10.0.0.3', '10.0.0.1', '10.0.0.4', '10.0.0.255'], 0, 'A /30 has 4 addresses (.0–.3); the last, .3, is the broadcast.'],
      ],
    },
    {
      id: 'cn-routing',
      name: 'Routing',
      description: 'Routing tables, default gateways, static and dynamic routing protocols.',
      difficulty: 4,
      importance: 80,
      minutes: 90,
      prerequisites: ['cn-ip'],
      explanation:
        'Routers forward packets between networks by consulting a routing table that maps destination prefixes to next hops. When several entries match, the router chooses the longest prefix match — the most specific route. Hosts send traffic for other networks to their default gateway. Routes can be configured statically or learned dynamically: distance-vector protocols such as RIP share hop counts with neighbours, link-state protocols such as OSPF build a full topology map, and BGP exchanges routes between autonomous systems on the Internet.',
      notes: [
        'Routing table: destination prefix → next hop / interface.',
        'Longest prefix match selects the most specific route.',
        'Default route 0.0.0.0/0 matches everything else.',
        'RIP: distance vector (hop count). OSPF: link state (Dijkstra).',
        'BGP: path-vector routing between autonomous systems.',
      ],
      code: {
        language: 'text',
        snippet:
          'Routing table\nDestination        Next hop        Interface\n10.1.0.0/16        192.168.0.2     eth1\n10.1.5.0/24        192.168.0.3     eth2\n0.0.0.0/0          203.0.113.1     eth0   (default route)\n\nPacket to 10.1.5.9  -> matches /16 and /24 -> /24 wins -> 192.168.0.3\nPacket to 10.1.9.1  -> matches /16 only           -> 192.168.0.2\nPacket to 8.8.8.8   -> default route              -> 203.0.113.1',
      },
      exercise:
        'Given a router with routes for 172.16.0.0/16, 172.16.4.0/22, 172.16.5.0/24 and a default route, determine the next hop for 172.16.5.10, 172.16.6.1, 172.16.200.4 and 10.0.0.1. Explain each decision using the longest-prefix rule.',
      questions: [
        ['What does a router use to decide where to forward a packet?', ['The source MAC address', 'Its routing table and the destination IP address', 'The packet’s TTL only', 'The DNS cache'], 1, 'Routers look up the destination IP in the routing table.'],
        ['When several routes match a destination, which one is chosen?', ['The oldest route', 'The default route', 'The route with the shortest prefix', 'The route with the longest matching prefix'], 3, 'The most specific (longest prefix) match wins.'],
        ['What is a default gateway?', ['The router a host sends traffic to when the destination is on another network', 'The DNS server', 'The switch port of a host', 'The broadcast address'], 0, 'Hosts forward off-network traffic to their default gateway.'],
        ['Which routing protocol is a link-state protocol?', ['RIP', 'BGP', 'OSPF', 'ARP'], 2, 'OSPF floods link-state information and computes shortest paths with Dijkstra’s algorithm.'],
        ['What does the route 0.0.0.0/0 represent?', ['A loopback address', 'The default route matching any destination', 'An invalid route', 'A broadcast route'], 1, 'A /0 prefix matches every address and is used when nothing more specific exists.'],
      ],
    },
    {
      id: 'cn-transport',
      name: 'TCP & UDP',
      description: 'Ports, the three-way handshake, reliability, flow control and UDP use cases.',
      difficulty: 3,
      importance: 90,
      minutes: 75,
      prerequisites: ['cn-tcpip'],
      explanation:
        'The transport layer delivers data between applications identified by port numbers. TCP is connection-oriented: it establishes a connection with a three-way handshake (SYN, SYN-ACK, ACK), numbers bytes with sequence numbers, retransmits lost segments, delivers data in order and uses flow and congestion control. UDP is connectionless and lightweight, offering no delivery guarantees, which makes it suitable for real-time media, gaming and DNS queries where low latency matters more than retransmission.',
      notes: [
        'Ports identify applications: HTTP 80, HTTPS 443, DNS 53, SSH 22.',
        'TCP handshake: SYN → SYN-ACK → ACK.',
        'TCP: reliable, ordered, flow + congestion control.',
        'UDP: connectionless, no retransmission, low overhead.',
        'Choose UDP when timeliness beats reliability (VoIP, games, streaming).',
      ],
      code: {
        language: 'python',
        snippet:
          'import socket\n\n# TCP client: connection-oriented, reliable byte stream\nwith socket.create_connection(("example.com", 80), timeout=5) as tcp:\n    tcp.sendall(b"HEAD / HTTP/1.1\\r\\nHost: example.com\\r\\n\\r\\n")\n    print(tcp.recv(200).decode(errors="replace"))\n\n# UDP: connectionless datagrams, no delivery guarantee\nudp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)\nudp.sendto(b"hello", ("127.0.0.1", 9999))\nudp.close()',
      },
      exercise:
        'Draw a sequence diagram of a TCP connection: the three-way handshake, two data segments with acknowledgements, one lost segment that is retransmitted, and the connection teardown. Then list three applications that use UDP and justify each choice.',
      questions: [
        ['What is the correct order of the TCP three-way handshake?', ['ACK, SYN, SYN-ACK', 'SYN, ACK, SYN-ACK', 'SYN, SYN-ACK, ACK', 'SYN-ACK, SYN, ACK'], 2, 'The client sends SYN, the server replies SYN-ACK, and the client confirms with ACK.'],
        ['Which protocol guarantees ordered, reliable delivery?', ['TCP', 'UDP', 'IP', 'ICMP'], 0, 'TCP uses sequence numbers, acknowledgements and retransmission.'],
        ['Why is UDP often used for live video calls?', ['It encrypts traffic automatically', 'It guarantees delivery', 'It always uses port 443', 'Low latency matters more than retransmitting lost packets'], 3, 'A late retransmitted video frame is useless; UDP avoids that delay.'],
        ['What identifies a specific application on a host at the transport layer?', ['MAC address', 'Port number', 'Subnet mask', 'TTL'], 1, 'Ports distinguish services such as 443 for HTTPS.'],
        ['What does TCP flow control prevent?', ['A fast sender overwhelming a slow receiver', 'Routing loops', 'IP address conflicts', 'DNS spoofing'], 0, 'The receiver advertises a window limiting how much unacknowledged data may be sent.'],
      ],
    },
    {
      id: 'cn-dns',
      name: 'DNS',
      description: 'Domain names, resolvers, the DNS hierarchy, record types and caching.',
      difficulty: 2,
      importance: 75,
      minutes: 45,
      prerequisites: ['cn-transport'],
      explanation:
        'The Domain Name System translates human-readable names such as example.com into IP addresses. A client asks a recursive resolver, which queries the DNS hierarchy: a root server points to the top-level domain (.com) server, which points to the domain’s authoritative name server, which returns the answer. Results are cached for the time-to-live (TTL) of each record. Common record types include A (IPv4), AAAA (IPv6), CNAME (alias), MX (mail server) and NS (name server). DNS queries normally use UDP port 53.',
      notes: [
        'DNS maps names to IP addresses (and more).',
        'Resolution path: resolver → root → TLD → authoritative server.',
        'Records: A, AAAA, CNAME, MX, NS, TXT.',
        'TTL controls how long answers are cached.',
        'Port 53, usually over UDP (TCP for large responses).',
      ],
      code: {
        language: 'bash',
        snippet:
          '# Look up the IPv4 address (A record)\nnslookup example.com\n\n# Query specific record types\ndig example.com A\ndig example.com AAAA\ndig gmail.com MX\n\n# Follow the delegation chain from the root\ndig +trace example.com',
      },
      exercise:
        'Use nslookup or dig to find the A, AAAA and MX records of three domains. Explain the full resolution path for www.example.edu when the resolver cache is empty, and what changes when the same query is repeated a minute later.',
      questions: [
        ['What is the main purpose of DNS?', ['Assigning IP addresses to hosts', 'Translating domain names into IP addresses', 'Encrypting web traffic', 'Routing packets between networks'], 1, 'DNS is the Internet’s naming directory.'],
        ['Which record type maps a name to an IPv4 address?', ['A', 'AAAA', 'MX', 'CNAME'], 0, 'A records hold IPv4 addresses; AAAA records hold IPv6 addresses.'],
        ['Which record type identifies the mail server for a domain?', ['NS', 'TXT', 'A', 'MX'], 3, 'MX (mail exchanger) records direct email delivery.'],
        ['What does the TTL of a DNS record control?', ['The number of routers a query may cross', 'The record’s encryption strength', 'How long resolvers may cache the answer', 'The priority of the record'], 2, 'Resolvers keep cached answers until the TTL expires.'],
        ['Which port and transport protocol does a typical DNS query use?', ['UDP port 53', 'TCP port 80', 'UDP port 443', 'TCP port 22'], 0, 'Standard queries use UDP port 53; TCP is used for large responses and zone transfers.'],
      ],
    },
    {
      id: 'cn-http',
      name: 'HTTP & HTTPS',
      description: 'Requests, responses, methods, status codes, headers and TLS.',
      difficulty: 3,
      importance: 85,
      minutes: 60,
      prerequisites: ['cn-transport', 'cn-dns'],
      explanation:
        'HTTP is the application protocol of the web. A client sends a request with a method (GET, POST, PUT, DELETE), a path and headers; the server returns a status code, headers and an optional body. Status codes are grouped by class: 2xx success, 3xx redirection, 4xx client errors and 5xx server errors. HTTP itself is stateless, so cookies or tokens are used to maintain sessions. HTTPS is HTTP over TLS, which encrypts traffic, protects integrity and authenticates the server using certificates.',
      notes: [
        'GET reads, POST creates, PUT replaces, PATCH updates, DELETE removes.',
        '200 OK, 201 Created, 301 Moved, 404 Not Found, 500 Server Error.',
        'HTTP is stateless — cookies/tokens maintain sessions.',
        'HTTPS = HTTP + TLS on port 443 (HTTP uses 80).',
        'TLS provides confidentiality, integrity and server authentication.',
      ],
      code: {
        language: 'http',
        snippet:
          'GET /api/topics?subject=web HTTP/1.1\nHost: learn.example.edu\nAccept: application/json\n\nHTTP/1.1 200 OK\nContent-Type: application/json\nCache-Control: max-age=60\n\n[{"id":"web-html","name":"HTML Fundamentals"}]\n\n# The same exchange over HTTPS is encrypted inside a TLS session on port 443.',
      },
      exercise:
        'Open your browser’s developer tools on any website, inspect five requests in the Network tab and record the method, status code, content type and whether caching headers are present. Explain what a 304 status means in that context.',
      questions: [
        ['Which HTTP method is intended for retrieving a resource without changing it?', ['POST', 'DELETE', 'GET', 'PUT'], 2, 'GET is a safe method intended only for retrieval.'],
        ['What does the status code 404 mean?', ['The server crashed', 'The requested resource was not found', 'The request succeeded', 'The resource moved permanently'], 1, '4xx codes are client errors; 404 means the resource does not exist at that URL.'],
        ['What does HTTPS add to HTTP?', ['Encryption, integrity and server authentication via TLS', 'Faster page loading only', 'Automatic caching', 'A different set of methods'], 0, 'HTTPS wraps HTTP in a TLS session.'],
        ['Which port does HTTPS use by default?', ['80', '21', '8080', '443'], 3, 'HTTP uses port 80 and HTTPS uses port 443.'],
        ['Why are cookies used with HTTP?', ['To compress responses', 'Because HTTP is stateless and sessions need to be maintained', 'To encrypt passwords', 'To resolve domain names'], 1, 'Cookies let a server recognise subsequent requests from the same client.'],
      ],
    },
    {
      id: 'cn-security',
      name: 'Network Security Basics',
      description: 'The CIA triad, common threats, firewalls, encryption and safe practices.',
      difficulty: 4,
      importance: 85,
      minutes: 90,
      prerequisites: ['cn-http'],
      explanation:
        'Network security protects the confidentiality, integrity and availability (the CIA triad) of data and services. Common threats include phishing, malware, man-in-the-middle attacks, and denial-of-service attacks that overwhelm services. Defences are layered: firewalls filter traffic according to rules, encryption (TLS, VPNs) protects data in transit, strong authentication with multi-factor methods protects accounts, and regular patching closes known vulnerabilities. Symmetric encryption uses one shared key, while asymmetric encryption uses a public/private key pair.',
      notes: [
        'CIA triad: Confidentiality, Integrity, Availability.',
        'Firewalls allow or block traffic based on rules (ports, addresses, state).',
        'Symmetric: one shared key (AES). Asymmetric: public/private keys (RSA, ECC).',
        'MITM attacks intercept traffic — TLS with certificate validation prevents them.',
        'Defence in depth: MFA, patching, least privilege, monitoring.',
      ],
      code: {
        language: 'text',
        snippet:
          'Example firewall policy (evaluated top to bottom)\n#  Action  Protocol  Source            Destination      Port\n1  ALLOW   TCP       any               web-server       443\n2  ALLOW   TCP       10.0.0.0/8        web-server       22\n3  ALLOW   UDP       10.0.0.0/8        dns-server       53\n4  DENY    any       any               any              any   (default deny)',
      },
      exercise:
        'Write a firewall rule set for a small college lab: allow web browsing, allow DNS to the internal resolver, allow SSH to one admin server only from the staff subnet, and deny everything else. Then explain which CIA property each of the following protects: TLS, backups, rate limiting and file hashes.',
      questions: [
        ['What does the CIA triad stand for?', ['Control, Inspection, Authentication', 'Confidentiality, Integrity, Availability', 'Cryptography, Identity, Access', 'Cyber, Internet, Application'], 1, 'These three properties are the core goals of information security.'],
        ['What is the role of a firewall?', ['To filter network traffic according to security rules', 'To speed up the network', 'To assign IP addresses', 'To store passwords'], 0, 'Firewalls allow or block traffic based on rules about addresses, ports and connection state.'],
        ['Which attack aims to make a service unavailable by overwhelming it with traffic?', ['Phishing', 'SQL injection', 'Man-in-the-middle', 'Denial of service'], 3, 'DoS and distributed DoS attacks target availability.'],
        ['How does asymmetric encryption differ from symmetric encryption?', ['It uses no keys', 'It is always faster', 'It uses a public/private key pair instead of one shared key', 'It only works on local networks'], 2, 'Data encrypted with the public key can only be decrypted with the private key.'],
        ['Which practice best protects accounts if a password is stolen?', ['Multi-factor authentication', 'Using a shorter password', 'Disabling encryption', 'Sharing the password with IT'], 0, 'MFA requires a second factor that an attacker with only the password does not have.'],
      ],
    },
  ],
};
